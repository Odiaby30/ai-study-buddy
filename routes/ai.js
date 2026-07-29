const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const Chat = require("../models/Chat");

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post("/ask", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Please enter a study question."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `
You are a helpful AI study tutor.

Explain the answer clearly using beginner-friendly language.

Question:
${question}
            `
        });

        const answer = response.text;

        const savedChat = await Chat.create({
            userId: req.session.userId,
            question: question.trim(),
            answer: answer
        });

        res.json({
            answer: answer,
            chat: savedChat
        });
    } catch (error) {
        console.error("Gemini error:", error);

        if (error.status === 429) {
            return res.status(429).json({
                message:
                    "Google temporarily limited the Gemini API. Wait a little and try again."
            });
        }

        if (error.status === 404) {
            return res.status(404).json({
                message: "The Gemini model is unavailable."
            });
        }

        res.status(500).json({
            message: "The AI could not answer right now."
        });
    }
});

module.exports = router;