import "server-only";

import { redis } from "@/cache";
import { Message } from "@/types";

export const publishMessageToConversation = async (conversationId: string, message: Message) => {
  try {
    await redis.publish(conversationId, JSON.stringify(message));
  } catch (error) {
    console.error("Error publishing message to Redis", error);
  }
}

export const subscribeToConversation = async (conversationId: string, callback: (message: Message) => void) => {
  try {
    const subscriber = redis.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(conversationId, (message) => {
      callback(JSON.parse(message) as Message);
    });
  } catch (error) {
    console.error("Error subscribing to Redis channel", error);
  }
}