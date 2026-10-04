import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding.js";

export const vectorStore = async (docs, collectionName) => {
  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_CLUSTER_URL,
    apiKey: process.env.QDRANT_CLUSTER_API_KEY,
    collectionName,
  });
  return vectorStore;
};
