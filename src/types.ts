
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


export const PATHNAME_HEADER = "x-pathname";
export const AUTH_COOKIE_NAME = "__session";