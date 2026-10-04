import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Chat DB connect sucessfully");
  } catch (error) {
    console.log(`Chat DB error ${error}`);
  }
};

export default connectDB;
