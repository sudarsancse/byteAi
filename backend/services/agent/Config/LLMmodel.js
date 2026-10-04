import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  // other params...
});

const gemini = new ChatGoogleGenerativeAI({
  // model: "gemini-2.5-flash",
  model: "gemini-3.6-flash",
  temperature: 0,
  maxRetries: 5,
  // other params...
});

const openrouter = new ChatOpenRouter({
  // model: "anthropic/claude-sonnet-4.5",
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens: 8192,
  // other params...
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return openrouter;
    case "pdf":
      return groq;
    case "ppt":
      return groq;
    case "imagegen":
      return groq;
    case "imageAnalyzer":
      return gemini;
    case "pdf-rag":
      return groq;
    case "intent":
      return groq;
    case "router":
      return groq; // fast + cheap, good fit for a routing task
    default:
      throw new Error(`getModel: unknown agent type "${agent}"`);
  }
};
