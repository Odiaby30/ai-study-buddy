const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Sign up
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please fill in every field."
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "That username or email is already being used."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Account created successfully!"
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Something went wrong while creating the account."
        });
    }
});

// Log in
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(400).json({
                message: "Incorrect email or password."
            });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({
            message: "Login successful!"
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong while logging in."
        });
    }
});

// Check whether a user is logged in
router.get("/user", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    res.json({
        username: req.session.username
    });
});

// Log out
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Could not log out."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully."
        });
    });
});

module.exports = router;