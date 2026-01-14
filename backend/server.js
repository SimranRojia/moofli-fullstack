const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routers/authRoutes");
const diaryRoutes = require("./routers/diaryRoutes");
const sharedDiaryRoutes = require("./routers/sharedDiaryRoutes");
const adminRoutes = require("./routers/adminRoutes");
const profileRoutes = require("./routers/profileRoutes")
const storyRoutes = require("./routers/storyRoutes");

// --- Initialize App ---
const app = express();

// --- Allowed Origins ---
const whitelist = [
  "http://localhost:3000",          
  "https://mooflidiary.vercel.app",
  "https://www.moofli.co.in"
];

// --- CORS Configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman, server-to-server, or whitelisted origins
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies or authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());
// server not working i guess
// --- Connect Database ---
connectDB();

// --- Routes ---
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/shared-diaries", sharedDiaryRoutes);
app.use("/api/story", storyRoutes);

// --- Health Check ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Server is running fine" });
});

// --- Global Error Handler (optional but recommended) ---
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  if (err.message.includes("CORS")) {
    return res.status(403).json({ success: false, message: "CORS policy violation" });
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
