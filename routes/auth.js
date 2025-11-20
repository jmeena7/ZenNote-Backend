const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');

// ✔️ Load .env safely (no custom path)
dotenv.config();

// ✔️ Validate env variables
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET missing in .env");
}
if (!process.env.MONGO_URL) {
    console.error("❌ MONGO_URL missing in .env");
}

/* --------------------------------------------------------
   📌 ROUTE 1: Create New User (Register)
--------------------------------------------------------- */
router.post(
    "/createuser",
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Enter a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, error: "⚠️ Email already in use" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword
            });

            const payload = { user: { id: user.id } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

            return res.status(201).json({
                success: true,
                message: "✅ User registered successfully",
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });

        } catch (error) {
            console.error("❌ Registration Error:", error.message);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

/* --------------------------------------------------------
   📌 ROUTE 2: Login 
--------------------------------------------------------- */
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password").exists().withMessage("Password is required"),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, error: "❌ Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, error: "❌ Invalid credentials" });
            }

            const payload = { user: { id: user.id } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

            return res.status(200).json({
                success: true,
                message: "✅ Login successful",
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });

        } catch (error) {
            console.error("❌ Login Error:", error.message);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

module.exports = router;
