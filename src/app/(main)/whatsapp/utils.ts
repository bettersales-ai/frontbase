import * as fs from "fs";
import * as path from "path";

import { eq } from "drizzle-orm";
import { createClient } from "redis";

import db, { contactsTable, conversationsTable, salesRepTable } from "@/db";

import { Contact, ContactConversation, Metadata, mimeToExtension } from "./types";
import { ReplyMessage, Video, Audio, Image, Document, MediaMessage } from "./reply";
import { Message } from "@/types";


const mediaRoot = "media";
const url = "https://graph.facebook.com/v20.0";


const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", err => console.log("Redis redis Error", err));

(async () => {
  await redis.connect();
})();

export async function sendMessage(message: ReplyMessage, whatsappNumberId: string, token: string): Promise<boolean> {
  let mes: ReplyMessage = message;
  if (["audio", "video", "document", "image"].includes(message.type)) {
    const newMessage = message as MediaMessage;
    const media = newMessage[newMessage.type] as Audio | Video | Document | Image;
    const filenameId = await uploadMedia(whatsappNumberId, media.file!, media.mime_type!, token);
    media.id = filenameId;

    newMessage[newMessage.type] = media;

    mes = newMessage;
  }

  const response = await fetch(`${url}/${whatsappNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(mes),
  });

  if (response.ok) {
    return true;
  }
  return false;
}

export async function downloadMedia(mediaId: string, mimeType: string, token: string): Promise<string> {
  const response = await fetch(`${url}/${mediaId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.statusText}`);
  }

  const data = await response.json();

  const downloadUrl = data.url;
  const filename = path.join(mediaRoot, `${mediaId}${mimeToExtension[mimeType]}`);

  fs.mkdirSync(path.dirname(filename), { recursive: true });

  const fileResponse = await fetch(downloadUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!fileResponse.ok) {
    throw new Error(`Failed to download media: ${fileResponse.statusText}`);
  }

  const fileBuffer = await fileResponse.arrayBuffer();
  const fileData = Buffer.from(fileBuffer);
  fs.writeFileSync(filename, fileData);
  return filename;
}

export async function uploadMedia(phoneNumberId: string, filename: string, mimeType: string, token: string): Promise<string> {
  const formData = new FormData();
  const fileBuffer = await fs.promises.readFile(filename);
  const fileBlob = new Blob([fileBuffer], { type: mimeType });
  formData.append("file", fileBlob, path.basename(filename));
  formData.append("type", mimeType);
  formData.append("messaging_product", "whatsapp");

  const response = await fetch(`${url}/${phoneNumberId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload media: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}


export class UserConversation {
  private static nullValue = "null";

  public static async getSalesRep(metadata: Metadata) {
    const [salesRep] = await db
      .select()
      .from(salesRepTable)
      .where(eq(salesRepTable.platform_id, metadata.phone_number_id));

    if (!salesRep) {
      throw new Error("Sales rep does not exist");
    }

    return salesRep;
  }

  public static async addMessageToConversation(conversationId: string, sender: Message["sender"], message: string) {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))

    if (!conversation) {
      throw new Error("Conversation does not exist");
    }

    await db
      .update(conversationsTable)
      .set({
        messages: [
          ...conversation.messages,
          {
            sender,
            type: "text",
            data: message,
            timestamp: Date.now(),
          }
        ]
      })
      .where(eq(conversationsTable.id, conversationId));
  }

  public static async getUserConversationId(contact: Contact, user_id: string, sales_rep: string) {
    const key = `contacts:${contact.wa_id}:conversation`;

    const data = await redis.get(key);

    // If this does not exist, then this is a new contact
    // If it exists value in null, then it previously had a convo
    if (!data) {
      const [newContact] = await db
        .insert(contactsTable)
        .values({
          name: contact.profile.name,
          whatsapp: contact.wa_id,
          user_id,
        }).returning();

      const [conversation] = await db
        .insert(conversationsTable)
        .values({
          user_id,
          sales_rep_id: sales_rep,
          contact_id: newContact.id,
        }).returning();

      await redis.set(key, JSON.stringify({
        contactId: newContact.id,
        currentConversation: conversation.id,
      } as ContactConversation));

      return conversation;
    }

    const contactConversation = JSON.parse(data) as ContactConversation;
    if (contactConversation.currentConversation == UserConversation.nullValue) {
      const [conversation] = await db
        .insert(conversationsTable)
        .values({
          user_id,
          sales_rep_id: sales_rep,
          contact_id: contactConversation.contactId,
        }).returning();

      contactConversation.currentConversation = conversation.id;
      await redis.set(key, JSON.stringify(contactConversation));
      return conversation;
    } else {
      const [conversation] = await db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.id, contactConversation.currentConversation));

      if (!conversation) {
        throw new Error(`Conversation ${contactConversation.currentConversation} does not exist`);
      }

      return conversation;
    }
  }

  public static async endUserConversation(userId: string, status: "failed" | "success"): Promise<void> {
    const key = `contacts:${userId}:conversation`;
    const data = await redis.get(key);

    if (!data) {
      throw new Error("Contact has no conversation");
    }

    const contactConversation = JSON.parse(data) as ContactConversation;

    await db
      .update(conversationsTable)
      .set({ status })
      .where(eq(conversationsTable.id, contactConversation.currentConversation));

    contactConversation.currentConversation = UserConversation.nullValue;
    await redis.set(`user:${userId}:conversation`, JSON.stringify(contactConversation));
  }
}