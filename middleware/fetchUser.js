const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const fetchUser = (req, res, next) => {
    console.log('🔐 JWT_SECRET in fetchUser:', process.env.JWT_SECRET);

    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: 'Access denied: No token provided' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not defined in .env file');
        return res.status(500).json({ error: 'Internal server error' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('❌ JWT Verification Failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = fetchUser;
