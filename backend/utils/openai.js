import "dotenv/config";
import { webSearch as runWebSearch } from "./search.js";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.MODEL || "gpt-4o-mini";
const MAX_STEPS = 3;          // model turns that may use the tool; last turn must answer
const MAX_SEARCHES_PER_TURN = 3;

const TOOLS = [{
    type: "function",
    function: {
        name: "web_search",
        description:
            "Search the web for current or uncertain information: news, prices, scores, releases, " +
            "recent events, people/companies, docs, anything after your training data or that you are not sure about. " +
            "Do NOT use for stable knowledge, math, code help, or chit-chat.",
        parameters: {
            type: "object",
            properties: { query: { type: "string", description: "Short, specific search query" } },
            required: ["query"]
        }
    }
}];

export function buildSystemPrompt({ username, memoryDigest, webSearch = true }) {
    const now = new Date();
    return [
        `You are G3-GPT, a fast, accurate chat assistant. Current date/time: ${now.toUTCString()}.`,
        username ? `The user is called ${username}.` : "",
        "",
        "How to work:",
        "- Answer directly and concisely first; add detail only when useful. Use markdown and fenced code blocks.",
        ...(webSearch ? [
            "- Use the web_search tool when the answer depends on current facts or you are not confident. Prefer ONE well-formed query; make more only if the first was insufficient.",
            "- Ground factual claims from search in the results, cite sources inline as [1], [2] matching result order, and say plainly when results are thin or conflicting."
        ] : [
            "- Web search is turned OFF by the user for this message. Answer from your own knowledge only, never claim to have searched, and for anything time-sensitive say your information may be out of date and suggest turning Web search on."
        ]),
        "- Never invent facts, URLs, quotes or numbers. If you don't know and cannot find out, say so.",
        "- Messages in the conversation are prefixed with the time the user sent them, e.g. [2026-11-10 14:03 UTC]. Use this to answer 'what did I ask / when' questions accurately. Never include these prefixes in your own replies.",
        "- Use remembered context naturally; don't recite it unless asked.",
        memoryDigest ? `\nEarlier conversations with this user (most recent first; for recall only, may be stale):\n${memoryDigest}` : ""
    ].filter(Boolean).join("\n");
}

const stamp = (d) => new Date(d || Date.now()).toISOString().slice(0, 16).replace("T", " ") + " UTC";

// Convert stored messages into model messages, with timestamps on user turns.
export function toModelMessages(stored) {
    return stored.slice(-20).map(m => ({
        role: m.role,
        content: m.role === "user" ? `[${stamp(m.timestamp)}] ${m.content}` : m.content
    }));
}

// Parse an OpenAI-style SSE stream, calling onToken for text; returns {content, toolCalls}.
async function streamCompletion(messages, { onToken, signal, allowTools }) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: true,
            temperature: 0.4,
            ...(allowTools ? { tools: TOOLS, tool_choice: "auto" } : {})
        }),
        signal
    });
    if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(`Model API ${res.status}: ${t.slice(0, 200)}`);
    }

    const decoder = new TextDecoder();
    const reader = res.body.getReader();
    let buf = "", content = "";
    const calls = []; // indexed tool-call accumulators

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
            const l = line.trim();
            if (!l.startsWith("data:")) continue;
            const data = l.slice(5).trim();
            if (data === "[DONE]") continue;
            let json;
            try { json = JSON.parse(data); } catch { continue; }
            const delta = json.choices?.[0]?.delta;
            if (!delta) continue;
            if (delta.content) { content += delta.content; onToken(delta.content); }
            for (const tc of delta.tool_calls || []) {
                const c = (calls[tc.index ?? 0] ||= { id: "", name: "", args: "" });
                if (tc.id) c.id = tc.id;
                if (tc.function?.name) c.name += tc.function.name;
                if (tc.function?.arguments) c.args += tc.function.arguments;
            }
        }
    }
    return { content, toolCalls: calls.filter(Boolean) };
}

/**
 * Run the agent loop. Emits events via emit({type, ...}):
 *  status {text} | token {text} | sources {sources}
 * Returns { reply, sources }.
 */
export async function runAgent({ history, username, memoryDigest, emit, signal, webSearch = true }) {
    const messages = [{ role: "system", content: buildSystemPrompt({ username, memoryDigest, webSearch }) }, ...toModelMessages(history)];
    const sources = [];
    let reply = "";

    for (let step = 0; step < MAX_STEPS; step++) {
        const allowTools = webSearch && step < MAX_STEPS - 1;
        const { content, toolCalls } = await streamCompletion(messages, {
            allowTools, signal,
            onToken: (t) => { reply += t; emit({ type: "token", text: t }); }
        });

        if (!toolCalls.length) break;

        messages.push({
            role: "assistant",
            content: content || null,
            tool_calls: toolCalls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args } }))
        });

        const batch = toolCalls.slice(0, MAX_SEARCHES_PER_TURN);
        const outputs = await Promise.all(batch.map(async (c) => {
            let query = "";
            try { query = JSON.parse(c.args || "{}").query || ""; } catch { /* ignore */ }
            if (c.name !== "web_search" || !query) return { id: c.id, out: { error: "invalid tool call" } };
            emit({ type: "status", text: `Searching the web: ${query}` });
            const out = await runWebSearch(query);
            return { id: c.id, out };
        }));

        // Any extra calls beyond the cap still need a tool response.
        for (const c of toolCalls.slice(MAX_SEARCHES_PER_TURN)) outputs.push({ id: c.id, out: { error: "too many searches; use existing results" } });

        for (const { id, out } of outputs) {
            // number results continuously so [n] citations map to the sources list
            const numbered = (out.results || []).map(r => {
                let idx = sources.findIndex(s => s.url === r.url);
                if (idx === -1) { sources.push({ title: r.title, url: r.url }); idx = sources.length - 1; }
                return { n: idx + 1, ...r };
            });
            messages.push({ role: "tool", tool_call_id: id, content: JSON.stringify({ ...out, results: numbered }) });
        }
        emit({ type: "sources", sources });
        emit({ type: "status", text: "Writing answer" });
    }

    return { reply: reply.trim(), sources };
}

// Cheap title for new threads.
export const makeTitle = (msg) => {
    const t = msg.replace(/\s+/g, " ").trim();
    return t.length > 40 ? t.slice(0, 40).trimEnd() + "…" : t;
};

export default runAgent;
