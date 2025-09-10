const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// ✅ Load .env file from current folder (backend root)
dotenv.config({ path: path.join(__dirname, '.env') });

// ✅ Check if env variables are loaded
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🌐 MONGO_URL:', process.env.MONGO_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/', (req, res) => {
    res.send('✅ Zennote backend running...');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
});
