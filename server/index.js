import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // ✅ Import cookie-parser
import connectDB from './config/db.js';
import narrationRoutes from './routes/narrationRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import authRoutes from './routes/authRoutes.js'; // ✅ Import Auth Routes
import userRoutes from './routes/userRoutes.js'; // ✅ Import User Routes

dotenv.config();

const app = express();

// ---------------- MIDDLEWARE ----------------
// ✅ FIX: Strict CORS to allow cookies
app.use(cors({
  origin: 'http://localhost:5173', // Must match your Frontend URL
  credentials: true // Allows the secure cookie to pass through
}));

app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies

// ---------------- ROUTES ----------------
app.use('/api/narration', narrationRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/auth', authRoutes); // ✅ Register Auth
app.use('/api/users', userRoutes); // ✅ Register User Profile

// ---------------- HEALTH CHECK ----------------
app.get('/', (req, res) => {
  res.send('Historia API is breathing...');
});

// ---------------- ERROR HANDLING ----------------
app.use((req, res, next) => {
  res.status(404).json({ message: "The scroll you seek does not exist." });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('📜 The Great Library archives are open');
    });
  } catch (error) {
    console.error('❌ Server failed to start due to DB error:', error.message);
    process.exit(1);
  }
};

startServer();