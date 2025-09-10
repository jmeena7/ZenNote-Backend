const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const path = require('path');

// ✅ Load .env from the same folder where index.js is located
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ✅ Check if required env variables are loaded
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in .env file');
}
if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env file');
}

// 📌 ROUTE 1: Register New User
router.post(
    '/createuser',
    [
        body('name', 'Name is required').notEmpty(),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
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
                return res.status(400).json({ success: false, error: '⚠️ Email already in use' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            const payload = { user: { id: user.id } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({
                success: true,
                message: '✅ User registered successfully',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch (err) {
            console.error('❌ Registration Error:', err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
);

// 📌 ROUTE 2: User Login
router.post(
    '/login',
    [
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password is required').exists(),
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
                return res.status(400).json({ success: false, error: '❌ Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, error: '❌ Invalid credentials' });
            }

            const payload = { user: { id: user.id } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                success: true,
                message: '✅ Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch (err) {
            console.error('❌ Login Error:', err.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
);

module.exports = router;
