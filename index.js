const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// ✅ Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// ✅ Check if env variables are loaded
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🌐 MONGO_URL:', process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:3000', 
  'https://zennote-backend-production.up.railway.app'
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `🚫 CORS error: The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Zennote backend running...');
});

// ✅ MongoDB connection
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
