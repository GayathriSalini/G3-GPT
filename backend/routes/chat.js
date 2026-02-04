import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";

const router = express.Router();

router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "sssa211111",
            title: "testing in route new test after return"
        });
        const response = await thread.save();
        res.send(response)
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: "didnt add the data thread" })
    }

})

//get all threads
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ createdAt: -1 });
        //most recent threds first 
        res.json(threads)
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "could not load/fetch the threads" })
    }
})

//getting specific thread by id
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ err: "thread not found" });
        }
        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "could not load/fetch the sepcific thread" })
    }
})


//delete the thread by id
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if (!deletedThread) {
            return res.status(404).json({ err: "thread not found" });
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
        let thread = await Thread.findOne({ threadId });
        if (!thread) {
            thread = new Thread({
                threadId,
                title: message,
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
            details: errorMessage.includes("buffering timed out") ? "Database connection timeout. Please check your MongoDB connection and IP whitelist." : errorMessage
        });
    }
})
export default router;