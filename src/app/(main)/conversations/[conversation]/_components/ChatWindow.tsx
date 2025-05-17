import React from "react";

import { Message } from "@/types";


interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border">
      <div className="min-h-[600px] overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p>{message.data}</p>
              <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;
