/* eslint-disable @typescript-eslint/no-explicit-any */

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

export interface PaymentMetadata {
  plan_id?: string;
  user_id?: string;
}


export interface PaystackData {
  event: "charge.success";
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: {
      time_spent: number;
      attempts: number;
      authentication: string;
      errors: number;
      success: boolean;
      mobile: boolean;
      input: any[];
      channel: null;
      history: {
        type: string;
        message: string;
        time: number;
      }[];
    };
    fees: number | null;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      account_name: string;
    };
    plan: Record<string, any>;
  };
}


export const PATHNAME_HEADER = "x-pathname";
export const AUTH_COOKIE_NAME = "__session";