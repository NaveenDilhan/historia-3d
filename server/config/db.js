import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Log the URI (hide password for safety) to verify formatting
    const dbUri = process.env.MONGODB_URI;
    console.log(`Attempting to connect to: ${dbUri.split('@')[1]}`); 

    const conn = await mongoose.connect(dbUri);
    
    // This will now show up in your terminal on success
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;