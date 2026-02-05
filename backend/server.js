/* import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const response = await client.responses.create({
    model: 'gpt-4o-mini',
   instructions: 'You are a coding assistant that talks like pirate.',
    input: 'Fun facts about computers'
});

console.log(response);  */

import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = 8000;

app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", chatRoutes);
app.use("/", authRoutes);

/* app.post('/test', async (req, res) => {

    // console.log("Request Headers:", req.headers);
    // console.log("Request Body:", req.body);

    // Check for correct Content-Type
    if (req.headers['content-type'] !== 'application/json') {
        console.error("ERROR: Incorrect Content-Type. Received: " + req.headers['content-type']);
        return res.status(400).json({
            error: "Invalid Content-Type. Please set 'Content-Type: application/json' in your request headers or select 'JSON' in Postman Body."
        });
    }

    // Check if body or message is provided
    if (!req.body || !req.body.message) {
        return res.status(400).json({ error: "Message is required in the request body." });
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: req.body.message
                }
            ]
        })

    };

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', options)
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            //console.log("AI Response:", data.choices[0].message.content);
            res.send(data.choices[0].message.content)
        }
        // res.send(data);
    } catch (err) {
        console.error(err)
        res.status(500).send("Something went wrong");
    }
}) */
app.get('/', (req, res) => {
    res.send("G3-GPT Auth Server is running!");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected to database")
    } catch (err) {
        console.log("connection error", err)
    }
}

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
    connectDB();
});
