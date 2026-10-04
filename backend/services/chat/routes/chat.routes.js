import express from "express";
import {
  createConversation,
  getAllMessage,
  getConversations,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controllers.js";

const router = express.Router();

router.get("/create-conversation", createConversation);
router.get("/get-conversations", getConversations);
router.get("/get-messages/:conversationId", getAllMessage);
router.post("/save-message", saveMessage);
router.post("/update-conversation", updateConversation);

export default router;
