import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Agent DB connected");
  } catch (error) {
    console.log(`Agent DB error ${error}`);
  }
};

export default connectDB;
