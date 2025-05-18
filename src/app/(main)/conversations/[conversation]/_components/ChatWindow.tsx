"use client";

import React from "react";

import { toast } from "sonner";

import { Message } from "@/types";

import JumpIn from "./JumpIn";


interface ChatWindowProps {
  messages: Message[];
  salesRepId: string;
  isActive: boolean;
  conversationId: string;
  currentStatus: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, isActive, salesRepId, currentStatus, messages }) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [_messages, setMessages] = React.useState<Message[]>(messages);

  const maxReconnectAttempts = 5;
  const reconnectAttempts = React.useRef(0);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function connect() {
      const eventSource = new EventSource(`/conversations/${conversationId}/events`);

      eventSource.addEventListener("open", () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      eventSource.addEventListener("ping", () => {
        setIsConnected(true);
      });

      eventSource.addEventListener("message", (event) => {
        const data = event.data;
        const parsedData = JSON.parse(data) as Message;
        setMessages((prevMessages) => [...prevMessages, parsedData]);
        // scroll document to the bottom
        window.scrollTo(0, document.body.scrollHeight);

        toast.success(`New message received`);
      });

      eventSource.addEventListener("error", (error) => {
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("Connection error:", error);
          setIsConnected(false);
          eventSource.close();

          if (reconnectAttempts.current < maxReconnectAttempts) {
            const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            reconnectAttempts.current += 1;

            console.log(`Reconnecting in ${backoffTime}ms...`);
            timeoutId = setTimeout(connect, backoffTime);
          } else {
            toast.error("Connection lost. Please refresh the page.");
          }
          return;
        }
        if (eventSource.readyState === EventSource.CONNECTING) {
          console.log("Reconnecting...");
          setIsConnected(false);
          return;
        }
      });

      return eventSource;
    }

    const eventSource = connect();

    return () => {
      eventSource.close();
      clearTimeout(timeoutId);
    };
  }, [conversationId]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  return (
    <>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border">
        <div className="p-2 border-b flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="min-h-[600px] overflow-y-auto p-4 space-y-4">
          {_messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.sender === "user"
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
      {isActive && (
        <JumpIn
          salesRepId={salesRepId}
          currentStatus={currentStatus}
          conversationId={conversationId}
          previousMessage={_messages[_messages.length - 1]}
        />
      )}
    </>
  );
};

export default ChatWindow;
