const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ⭐ Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://zennotef.netlify.app",
  "https://zennote-frontend.vercel.app"
];

// ⭐ Correct CORS Settings (with auth-token FIX)
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman/mobile

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "auth-token"],  // ⭐ FIXED
};

// ⭐ Apply CORS
app.use(cors(corsOptions));

// ⭐ Preflight OPTIONS
app.options("*", cors(corsOptions));

// ⭐ Body Parser
app.use(express.json());

// ⭐ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// ⭐ Health Check
app.get("/", (req, res) => {
  res.send("✅ Zennote backend running...");
});

// ⭐ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
