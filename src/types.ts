export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface WhatsAppCredentials {
  phoneNumber: string;
  accessToken: string;
  phoneNumberId: string;
}


export interface Message {
  data: string;
  timestamp: number;
  sender: "user" | "agent";
  type: "text" | "image" | "video" | "audio" | "file";
}


export const PATHNAME_HEADER = "x-pathname";
export const AUTH_COOKIE_NAME = "__session";