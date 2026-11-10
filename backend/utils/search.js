import "dotenv/config";

const TIMEOUT_MS = 8000;

const clip = (s = "", n = 400) => (s.length > n ? s.slice(0, n) + "…" : s);

const decodeEntities = (s = "") =>
    s.replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

// Preferred: Tavily (fast, clean snippets, built for LLMs). Needs TAVILY_API_KEY.
async function tavilySearch(query, signal) {
    const r = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
        body: JSON.stringify({ query, max_results: 5, search_depth: "basic", include_answer: true }),
        signal
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}`);
    const d = await r.json();
    return {
        answer: d.answer || null,
        results: (d.results || []).map(x => ({ title: x.title, url: x.url, snippet: clip(x.content) }))
    };
}

// Fallback: no API key needed (DuckDuckGo HTML endpoint).
async function ddgSearch(query, signal) {
    const r = await fetch("https://html.duckduckgo.com/html/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (G3-GPT)" },
        body: new URLSearchParams({ q: query }),
        signal
    });
    if (!r.ok) throw new Error(`DuckDuckGo ${r.status}`);
    const html = await r.text();
    const results = [];
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html)) && results.length < 5) {
        let url = decodeEntities(m[1]);
        const u = url.match(/uddg=([^&]+)/);
        if (u) url = decodeURIComponent(u[1]);
        if (url.startsWith("//")) url = "https:" + url;
        results.push({ title: decodeEntities(m[2]), url, snippet: clip(decodeEntities(m[3])) });
    }
    return { answer: null, results };
}

const cache = new Map(); // tiny 5-min cache so repeated queries are instant
const TTL = 5 * 60 * 1000;

export async function webSearch(query) {
    const key = query.trim().toLowerCase();
    const hit = cache.get(key);
    if (hit && Date.now() - hit.t < TTL) return hit.v;

    const signal = AbortSignal.timeout(TIMEOUT_MS);
    let value;
    try {
        value = process.env.TAVILY_API_KEY ? await tavilySearch(query, signal) : await ddgSearch(query, signal);
    } catch (err) {
        value = { error: `Search failed: ${err.message}`, results: [] };
    }
    if (!value.error) {
        cache.set(key, { t: Date.now(), v: value });
        if (cache.size > 200) cache.delete(cache.keys().next().value);
    }
    return value;
}
