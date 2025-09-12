const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🌐 MONGO_URL:', process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://zennotef.netlify.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ Zennote backend running...');
});

// MongoDB connection
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
