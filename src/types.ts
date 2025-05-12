export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface WhatsAppCredentials {
  accessToken: string;
  phoneNumberId: string;
}


export interface Message {
  id: string;
  data: string;
  timestamp: string;
  sender: "user" | "agent";
  type: "text" | "image" | "video" | "audio" | "file";
}


export const PATHNAME_HEADER = "x-pathname";
export const AUTH_COOKIE_NAME = "__session";