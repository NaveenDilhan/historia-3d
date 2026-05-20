import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import path from 'path'; // Added for serving static files
import connectDB from './config/db.js';
import narrationRoutes from './routes/narrationRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js'; 
import postRoutes from './routes/postRoutes.js'; // Added Post Routes

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser()); 

// ---------------- STATIC FILES ----------------
// Make the 'uploads' folder publicly accessible for image fetching
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------- ROUTES ----------------
app.use('/api/narration', narrationRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/posts', postRoutes); // Mount Post Routes

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