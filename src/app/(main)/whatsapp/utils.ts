import * as fs from "fs";
import * as path from "path";

import { nanoid } from "nanoid";
import { createClient } from "redis";

import { mimeToExtension } from "./types";
import { ReplyMessage, Video, Audio, Image, Document, MediaMessage } from "./reply";


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
  public static async getUserConversationId(userId: string): Promise<string> {
    const res = await redis.get(`user:${userId}:conversation`);

    if(!res) {
      const id = nanoid();
      await redis.set(`user:${userId}:conversation`, id);
      return id;
    }

    return res;
  }

  public static async endUserConversation(userId: string): Promise<void> {
    await redis.del(`user:${userId}:conversation`);
  }
}