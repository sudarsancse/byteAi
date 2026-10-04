import redis from "../../../shared/redis/redis.js";

import { getMessages } from "../utils/getMessages.js";

export const getMemory = async (conversationId) => {
  //% IF DATA EXIST IN MEMORY (REDIS)
  const key = `messages-${conversationId}`;
  const cached = await redis.get(key); // from redis we get stringify data not json data

  if (cached) {
    return JSON.parse(cached); // it convert the stringify data to JSON data
  }

  //% IF DATA NOT EXIST IN MEMORY (REDIS) THEN SAVE THE DATA IN MEMORY (REDIS)
  const messages = await getMessages(conversationId);
  await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60); // in redis we store as a stringify data not JSON

  return messages;
};

//^ IF DATA EXIST IN MEMORY (REDIS) ALONG WITH ADD SOME NEW DATA
export const addMEssage = async (conversationId, role, content) => {
  //claude code
  if (!content) {
    console.warn(`Skipped saving empty ${role} message for ${conversationId}`);
    return;
  }
  //* STORE ONLY MOST 20 RECENT MSG ONLY IN REDIS
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  const messages = rawMessages ? JSON.parse(rawMessages) : [];

  messages.push({
    role,
    content,
  });

  //! MORE THEN 20 MSG THEN ROMEVE THE LST MSG FROM THE REDIS
  if (messages.length > 20) {
    messages.shift();
  }

  // * ADD NEW MSG IN REDIS
  await redis.set(key, JSON.stringify(messages));
};
