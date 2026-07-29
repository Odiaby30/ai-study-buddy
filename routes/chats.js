const express = require("express");
const Chat = require("../models/Chat");

const router = express.Router();

// Get all chats belonging to the logged-in user
router.get("/", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const chats = await Chat.find({
            userId: req.session.userId
        }).sort({
            createdAt: -1
        });

        res.json(chats);
    } catch (error) {
        console.error("Load chats error:", error);

        res.status(500).json({
            message: "Could not load your chat history."
        });
    }
});

// Update one saved chat question/title
router.put("/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Please enter a new chat title."
            });
        }

        const updatedChat = await Chat.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.session.userId
            },
            {
                question: question.trim()
            },
            {
                new: true
            }
        );

        if (!updatedChat) {
            return res.status(404).json({
                message: "Chat not found."
            });
        }

        res.json({
            message: "Chat renamed.",
            chat: updatedChat
        });
    } catch (error) {
        console.error("Update chat error:", error);

        res.status(500).json({
            message: "Could not rename the chat."
        });
    }
});

// Delete one saved chat
router.delete("/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const deletedChat = await Chat.findOneAndDelete({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!deletedChat) {
            return res.status(404).json({
                message: "Chat not found."
            });
        }

        res.json({
            message: "Chat deleted."
        });
    } catch (error) {
        console.error("Delete chat error:", error);

        res.status(500).json({
            message: "Could not delete the chat."
        });
    }
});

module.exports = router;