import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";
import { userVerification } from "../middleware/authmiddle.js";

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(userVerification);

//get all threads for the logged-in user
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.userId }).sort({ createdAt: -1 });
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


//main new chat 
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" })
    }

    try {
        let thread = await Thread.findOne({ threadId, userId: req.userId });
        if (!thread) {
            thread = new Thread({
                threadId,
                userId: req.userId, // Associate with current user
                title: message.substring(0, 30), // Use first 30 chars as title
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getOpenAIResponse(message);
        thread.messages.push({ role: "assistant", content: assistantReply })

        await thread.save();
        res.json({ reply: assistantReply });

    } catch (err) {
        console.error("Chat error details:", err);
        const errorMessage = err.message || "Unknown error";
        res.status(500).json({
            error: "Something went wrong while processing your chat.",
            details: errorMessage
        });
    }
})
export default router;
