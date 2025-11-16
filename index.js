const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Check env variables
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🌐 MONGO_URL:', process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// ⭐ Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://zennotef.netlify.app',    // your Netlify frontend
  'https://zennote-frontend.vercel.app' // (optional) Vercel frontend
];

// ⭐ FINAL CORS FIX
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman & server-to-server calls

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true
}));

// Parse JSON
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('✅ Zennote backend running...');
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
