import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import narrationRoutes from './routes/narrationRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js'; // 1. Import new routes

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- ROUTES ----------------
app.use('/api/narration', narrationRoutes);
app.use('/api/lessons', lessonRoutes); // 2. Register Lesson API

// ---------------- HEALTH CHECK ----------------
app.get('/', (req, res) => {
  res.send('Historia API is breathing...');
});

// ---------------- ERROR HANDLING ----------------
// Catch-all for 404s
app.use((req, res, next) => {
  res.status(404).json({ message: "The scroll you seek does not exist." });
});

// Global error middleware
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
    process.exit(1); // Exit process with failure
  }
};

startServer();