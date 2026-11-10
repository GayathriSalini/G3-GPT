import express from "express";
import Thread from "../models/Thread.js";
import { runAgent, makeTitle } from "../utils/openai.js";
import { userVerification } from "../middleware/authmiddle.js";

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(userVerification);

//get all threads for the logged-in user
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
        //most recent threads first 
        res.json(threads)
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "could not load/fetch the threads" })
    }
})

//getting specific thread by id (must belong to the user)
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId, userId: req.userId });
        if (!thread) {
            return res.status(404).json({ err: "thread not found or access denied" });
        }
        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "could not load/fetch the specific thread" })
    }
})


//delete the thread by id (must belong to the user)
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.userId });

        if (!deletedThread) {
            return res.status(404).json({ err: "thread not found or access denied" });
        }

        res.status(200).json({ success: "thread deleted successfully" })
    } catch (err) {
        res.status(500).json({ err: "could not delete this thread" });
    }
})


//main chat: streams Server-Sent Events (status | token | sources | done | error)
router.post("/chat", async (req, res) => {
    const { threadId, message, webSearch = true } = req.body;

    if (!threadId || !message || typeof message !== "string" || message.length > 8000) {
        return res.status(400).json({ error: "missing or invalid fields" })
    }

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
    });
    const emit = (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`);

    const abort = new AbortController();
    res.on("close", () => abort.abort());

    try {
        let thread = await Thread.findOne({ threadId, userId: req.userId });
        if (!thread) {
            thread = new Thread({ threadId, userId: req.userId, title: makeTitle(message), messages: [] });
        }
        thread.messages.push({ role: "user", content: message });

        // Cross-thread memory: what this user asked recently, and when.
        const others = await Thread.find({ userId: req.userId, threadId: { $ne: threadId } })
            .sort({ updatedAt: -1 }).limit(8).select("title updatedAt messages");
        const memoryDigest = others.map(t => {
            const qs = t.messages.filter(m => m.role === "user").slice(-3)
                .map(m => `"${m.content.slice(0, 120)}"`).join("; ");
            return `- ${new Date(t.updatedAt).toISOString().slice(0, 10)} "${t.title}": asked ${qs}`;
        }).join("\n");

        const { reply, sources } = await runAgent({
            history: thread.messages, username: req.username, memoryDigest, emit, signal: abort.signal,
            webSearch: webSearch !== false
        });

        thread.messages.push({ role: "assistant", content: reply || "No response from AI", sources });
        thread.updatedAt = new Date();
        await thread.save();
        emit({ type: "done" });
    } catch (err) {
        if (!abort.signal.aborted) {
            console.error("Chat error details:", err);
            emit({ type: "error", error: err.message || "Unknown error" });
        }
    } finally {
        res.end();
    }
})
export default router;
