"use client";

import React, { useState } from "react";

import { Message } from "@/types";
import { useDebounce } from "@/ui/utils";

import { sendWhatsappMessage, endConversation, showTypingIndicatorOnWhatsapp, toggleHandoff } from "../actions";


interface JumpInProps {
  salesRepId: string;
  conversationId: string;
  currentStatus: boolean;
  previousMessage: Message;
}

const JumpIn = ({ conversationId, salesRepId, previousMessage, currentStatus }: JumpInProps): React.ReactElement => {
  const [message, setMessage] = useState("");

  const debouncedMessage = useDebounce<string>(message, 5000);

  React.useEffect(() => {
    (async () => {
      if (previousMessage.sender === "user") {
        if (debouncedMessage) {
          await showTypingIndicatorOnWhatsapp(
            previousMessage.platform_id,
            salesRepId,
          );
        }
      }
    })();
  }, [debouncedMessage, previousMessage, salesRepId]);

  const onClickJumpIn = async () => {
    await toggleHandoff(conversationId, !currentStatus);
  }

  const onClickEndConversation = async () => {
    await endConversation(conversationId);
  }

  const sendMessage = async () => {
    await sendWhatsappMessage(
      conversationId,
      salesRepId,
      message,
    );
    setMessage("");
  }

  return (
    <>
      {!currentStatus && (
        <button onClick={onClickJumpIn} className="fixed bottom-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors">
          Jump In!
        </button>
      )}

      {currentStatus && (
        <div className="flex gap-2 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl">
          <div className="flex border items-center gap-2 w-full bg-white rounded-full shadow-lg p-2">
            <input
              type="text"
              value={message}
              placeholder="Type your message..."
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent outline-none"
            />
            <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors">
              Send
            </button>
            <button onClick={onClickJumpIn} className="bg-red-500 text-nowrap hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
              End
            </button>
            <button onClick={onClickEndConversation} className="bg-red-500 text-nowrap hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
              End Conversation
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default JumpIn;