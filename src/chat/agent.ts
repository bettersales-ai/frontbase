import OpenAI from "openai";
import { createClient } from "redis";
import { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/index";

import { agentToolToTool, ToolCallEvent, TypedEventEmitter } from "./utils";
import { SessionStatus, AgentTool, AgentResponse } from "./types";


const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", err => console.log("Redis redis Error", err));

(async () => {
  await redis.connect();
})();

const special_messages = `
\n\n
When you have concluded the chat with a customer
append the following text: \`<END>\` at the end of your last message."
`

class AgentSession {
  private readonly openai: OpenAI;
  private readonly sessionId: string;
  private readonly historySize: number;

  private readonly modelName: string = process.env.MODEL_NAME || "gpt-3.5-turbo";

  constructor(sessionId: string, historySize: number = 100) {
    this.sessionId = sessionId;
    this.historySize = historySize;

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_BASE_URL,
    });
  }

  private async getTools(): Promise<AgentTool[]> {
    const key = `session:${this.sessionId}:tools`;
    const toolsData = await redis.get(key);
    if (toolsData) {
      return JSON.parse(toolsData) as AgentTool[];
    }
    return [];
  }

  public async initialize(systemMessage: string, tools: AgentTool[] = []): Promise<void> {
    const key = `session:${this.sessionId}`;
    const toolsKey = `session:${this.sessionId}:tools`;

    await redis.set(toolsKey, JSON.stringify(tools));

    const existingSession = await redis.exists(key);
    if (existingSession) {
      throw new Error("Session already exists");
    }

    const systemMessageObj: ChatCompletionMessageParam = {
      role: "system",
      content: systemMessage + special_messages,
    };

    await redis.rPush(key, JSON.stringify(systemMessageObj));
    await redis.lTrim(key, 0, this.historySize);
  }

  private async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const tools = await this.getTools();
    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    const response = await fetch(tool.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Tool call failed: ${response.statusText}`);
    }

    return response.text();
  }

  private async handleToolCalls(message: ChatCompletionMessage): Promise<AgentResponse> {
    const toolCallHandler = async () => {
      const emitter = new TypedEventEmitter<ToolCallEvent>();
      for (const toolCall of message.tool_calls!) {
        const toolCallId = toolCall.id;
        const name = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        emitter.emit("tool_call", name);

        const res = await this.callTool(name, toolArgs);
        await this.addMessageToHistory({
          // @ts-expect-error Value may not be allowed
          name,
          role: "tool",
          content: res,
          tool_call_id: toolCallId,
        });

        emitter.emit("tool_call", name);
      }

      return emitter;
    }

    return {
      isEnded: false,
      toolCallHandler,
      type: "tool_call",
    }
  }

  public async continueChat(): Promise<AgentResponse> {
    const tools = await this.getTools();
    const chatHistory = await this.getChatHistory();
    if (chatHistory.length === 0) {
      throw new Error("Session not initialized");
    }

    const response = await this.openai.chat.completions.create({
      n: 1,
      tool_choice: "auto",
      model: this.modelName,
      messages: chatHistory,
      tools: tools.map(agentToolToTool),
    });

    const assistantMessage = response.choices[0].message;
    await this.addMessageToHistory(assistantMessage);

    let res: AgentResponse;
    if (assistantMessage.tool_calls) {
      res = await this.handleToolCalls(assistantMessage);
    } else {
      const isEnded = await this.checkSessionEnded(assistantMessage.content || "");
      if (isEnded) {
        await redis.set(`session:${this.sessionId}:status`, "ended");
      }
      res = {
        isEnded,
        type: "message",
        message: assistantMessage.content || "",
      }
    }
    return res;
  }

  public async send(message: string): Promise<AgentResponse> {
    const tools = await this.getTools();
    const chatHistory = await this.getChatHistory();

    if (chatHistory.length === 0) {
      throw new Error("Session not initialized");
    }

    const response = await this.openai.chat.completions.create({
      n: 1,
      tool_choice: "auto",
      model: this.modelName,
      tools: tools.map(agentToolToTool),
      messages: [
        ...chatHistory,
        { role: "user", content: message }
      ],
    });

    const assistantMessage = response.choices[0].message;
    await this.addMessageToHistory(assistantMessage);

    let res: AgentResponse;

    if (assistantMessage.tool_calls) {
      res = await this.handleToolCalls(assistantMessage);
    } else {
      const isEnded = await this.checkSessionEnded(assistantMessage.content || "");
      if (isEnded) {
        await redis.set(`session:${this.sessionId}:status`, "ended");
      }
      res = {
        isEnded,
        type: "message",
        message: assistantMessage.content || "",
      }
    }

    return res;
  }

  public async getSessionStatus(): Promise<SessionStatus> {
    const key = `session:${this.sessionId}:status`;
    const status = await redis.get(key);
    if (status) {
      return status as SessionStatus;
    } else {
      await redis.set(key, "active");
      return "active";
    }
  }

  private async getChatHistory(): Promise<ChatCompletionMessageParam[]> {
    const key = `session:${this.sessionId}`;

    const cachedData = await redis.lRange(key, 0, -1);
    return cachedData
      .map(item => JSON.parse(item) as ChatCompletionMessageParam);
  }

  private async addMessageToHistory(message: ChatCompletionMessageParam): Promise<void> {
    const key = `session:${this.sessionId}`;

    await redis.rPush(key, JSON.stringify(message));
    await redis.lTrim(key, 0, this.historySize);
  }

  private async checkSessionEnded(message: string): Promise<boolean> {
    const key = `session:${this.sessionId}`;

    if (message.includes("<END>")) {
      await redis.set(key + ":status", "ended");
      return true;
    }

    return false;
  }

}


export default AgentSession;