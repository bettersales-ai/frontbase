import { ToolCallEvent, TypedEventEmitter } from "./utils";

export type SessionStatus = "active" | "ended";

export type Type = "string" | "array" | "integer" | "object" | "number" | "boolean";

export interface ModelConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

export interface AgentToolParameter {
  type: Type;
  name: string;
  required: boolean;
  defaultValue?: string | number | boolean;
}

export interface AgentTool {
  url: string;
  name: string;
  description: string;
  parameters: AgentToolParameter[];
}

export type ToolCallState = "pending" | "completed" | "failed";

export type MessageType = "message" | "tool_call";

export interface AgentResponse {
  isEnded: boolean;
  message?: string;
  type: MessageType;
  toolCallHandler?: () => Promise<TypedEventEmitter<ToolCallEvent>>;
}