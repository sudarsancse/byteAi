import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../Config/LLMmodel.js";
import { getMemory } from "../Config/memory.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";
import { checkLimit } from "../Config/agentLimit.js";

export const chatAgent = async (state) => {
  try {
    await checkLimit(state.userId, "chat");
    const llm = await getModel("chat");

    const history = await getMemory(state.conversationId);

    const searchContext = state.searchResults
      ? ` Web search Results: ${JSON.stringify(state.searchResults)} Answer the user only the above search results. `
      : "";

    const systemPrompt = `You are Byte AI, a helpful and friendly AI assistant.

  ${searchContext}

  if searchContext is exists:
- Use search results to answer,
- Do not mention internal tools.

Rules:
- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.

Formatting:
- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
`;
    const messages = [new SystemMessage(systemPrompt)];

    history.forEach((msg) => {
      // claude
      if (!msg.content) return; // skip corrupted/empty turns

      if (msg.role == "user") {
        messages.push(new HumanMessage(msg.content));
      } else {
        messages.push(new AIMessage(msg.content));
      }
    });

    messages.push(new HumanMessage(state.prompt));
    // console.log(messages);

    const res = await llm.invoke(messages);

    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "chat");

    return {
      ...state,
      aiResponse: res.content,
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to generate response",
    };
  }
};
