import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
    },
    userId: {
      type: String,
    },
  },
  { timestamps: true },
);

const ConversationModel = mongoose.model("COnversation", conversationSchema);

export default ConversationModel;
