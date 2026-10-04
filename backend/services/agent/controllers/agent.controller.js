import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMEssage } from "../Config/memory.js";
import redis from "../../../shared/redis/redis.js";

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    const userId = req.headers["x-user-id"];
    const file = req.file;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file,
    });

    const response = result.aiResponse;

    if (!response) {
      console.error(
        "aiResponse was empty/undefined for conversation:",
        conversationId,
      );
      return res.status(500).json({ message: "Agent produced no response" });
    }

    await addMEssage(conversationId, "user", prompt);

    await addMEssage(conversationId, "assistant", response);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
    });

    // console.log("Saving assistant message:", {
    //   conversationId,
    //   content: result.aiResponse,
    //   images: result.images,
    // });

    return res.status(200).json({
      answer: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
    });
  } catch (error) {
    next(error);
    // console.error("Agent error:", error);
    // return res.status(500).json({ message: `Agent error ${error}` });
  }
};
