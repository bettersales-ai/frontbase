import { MessageType } from "./types";

export interface Text {
  preview_url: boolean;
  body: string;
}

export interface Audio {
  file: string;
  mime_type: string;
  id?: string
  link?: string
}

export interface Video {
  file: string;
  mime_type: string;
  id?: string
  link?: string
  caption?: string
}

export interface Document {
  file: string;
  mime_type: string;
  id?: string
  link?: string
  caption?: string
  filename?: string
}

export interface Image {
  file: string;
  mime_type: string;
  id?: string
  link?: string
  caption?: string
}

export interface Context {
  message_id: string;
}

export interface Sticker {
  file: string;
  mime_type: string;
  id?: string
  link?: string
}

export interface Message {
  to: string;
  type: MessageType;

  context?: Context
  messaging_product: "whatsapp";
}

export interface MediaMessage extends Message {
  type: "audio" | "video" | "image" | "document";
  audio?: Audio
  video?: Video
  image?: Image
  document?: Document
}

export interface TextMessage extends Message {
  text: Text
}

export type ReplyMessage = TextMessage | MediaMessage;