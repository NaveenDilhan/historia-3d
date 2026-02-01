import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import narrationRoutes from './routes/narrationRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/narration', narrationRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // Wait for DB first
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ Database status: Connected');
    });
  } catch (error) {
    // This will catch the EBADNAME error and log it clearly
    console.error('❌ Server failed to start due to DB error:', error.message);
  }
};

startServer();