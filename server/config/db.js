import mongoose from 'mongoose';

const connectDB = async () => {
  try {
   
    const dbUri = process.env.MONGODB_URI;
    console.log(`Attempting to connect to: ${dbUri.split('@')[1]}`); 

    const conn = await mongoose.connect(dbUri);
    
   
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;