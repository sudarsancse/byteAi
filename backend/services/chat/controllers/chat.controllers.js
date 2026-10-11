import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";

//! CREATE CONVERSATION CONTROLLER
export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    // console.log(`user ID : ${userId}`);
    const conversation = await ConversationModel.create({
      userId: userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create cnversstion error : ${error}` });
  }
};

//! GET ALL CONVERSATION CONTROLLER
export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    // console.log(`user ID : ${userId}`);
    const conversations = await ConversationModel.find({
      userId: userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get cnversstion error : ${error}` });
  }
};

//! UPDATE CONVERSATION CONTROLLER
export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    if (!id || !title) {
      return res.status(400).json({
        message: "Both 'id' and 'title' are required",
      });
    }

    const conversation = await ConversationModel.findByIdAndUpdate(
      id,
      {
        title,
      },
      { returnDocument: "after" },
      { new: true },
    );

    if (!conversation) {
      return res.status(404).json({
        message: `Conversation with id ${id} not found`,
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update conversation error : ${error}` });
  }
};

//! SAVE MESSAGE CONTROLLER
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts } = req.body;

    if (!conversationId || !role || !content) {
      return res.status(400).json({
        message: "'conversationId', 'role', and 'content' are required",
      });
    }

    const Message = await MessageModel.create({
      conversationId,
      content,
      role,
      images,
      artifacts,
    });

    return res.status(200).json(Message);
  } catch (error) {
    return res.status(500).json({ message: `Save message error : ${error}` });
  }
};

//! GET ALL MESSAGE CONTROLLER
export const getAllMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        message: "'conversationId' is required",
      });
    }

    const Messages = await MessageModel.find({
      conversationId,
    });

    return res.status(200).json(Messages);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get all message error : ${error}` });
  }
};

//! DELETE CONVERSATION & ALL MESSAGES CONTROLLER
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "'id' is required" });
    }

    // only delete if the conversation belongs to this user
    const conversation = await ConversationModel.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        message: `Conversation with id ${id} not found`,
      });
    }

    // delete all messages of this conversation
    await MessageModel.deleteMany({ conversationId: id });

    return res.status(200).json({
      message: "Conversation and its messages deleted successfully",
      id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Delete conversation error : ${error}` });
  }
};
