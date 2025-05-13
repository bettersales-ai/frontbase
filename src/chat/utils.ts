import EventEmitter from "events";

import { ChatCompletionTool } from "openai/resources/index";

import { type AgentTool } from "./types";


export function agentToolToTool(agentTool: AgentTool): ChatCompletionTool {
  const required: string[] = [];
  const properties: Record<string, Record<string, unknown>> = {};

  for (const param of agentTool.parameters) {
    if (param.required) {
      required.push(param.name);
    }

    const paramSchema: Record<string, unknown> = {
      type: param.type
    };

    if (param.defaultValue !== undefined) {
      paramSchema.default = param.defaultValue;
    }

    properties[param.name] = paramSchema;
  }

  return {
    type: "function",
    function: {
      name: agentTool.name,
      description: agentTool.description,
      parameters: {
        type: "object",
        required,
        properties,
      },
    },
  };
}

export type ToolCallEvent = {
  "tool_call": [tool: string]
  "end": []
}


export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
  private emitter = new EventEmitter()

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    // @ts-expect-error Idk
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as TEvents[TEventName][]))
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName][]) => void
  ) {
    this.emitter.on(eventName, handler)
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName][]) => void
  ) {
    this.emitter.off(eventName, handler)
  }
}
