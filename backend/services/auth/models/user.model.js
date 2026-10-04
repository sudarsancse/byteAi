import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avater: {
      type: String,
    },
    plan: {
      type: String,
      default: "free",
    },
    credits: {
      type: Number,
      default: 100,
    },
    totalCredits: {
      type: Number,
      default: 100,
    },
    planEXPAt: Date,
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
