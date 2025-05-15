import React from "react";

import { unauthorized } from "next/navigation";

import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Circle } from "lucide-react";

import { getCurrentUser } from "@/utils";
import db, { conversationsTable, contactsTable, salesRepTable } from "@/db";


const Conversations = async (): Promise<React.ReactElement> => {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const conversations = await Promise.all((await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.user_id, user.id))
    .orderBy(desc(conversationsTable.updated_at))
  ).map(async (conversation) => {
    const [contact] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, conversation.contact_id))
    
    const [sales_rep] = await db
      .select()
      .from(salesRepTable)
      .where(eq(salesRepTable.id, conversation.sales_rep_id))
    
    return {
      ...conversation,
      messages: conversation.messages.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }),
      contact: {
        name: contact.name,
      },
      sales_rep: {
        name: sales_rep.name,
      },
    };
  }));

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Conversations</h1>
        <p className="text-gray-600 text-lg">Create kick-ass ads for your business</p>
      </div>

      <div className="space-y-4 w-full max-w-[50rem]">
        {conversations.map((conversation) => (
          <button key={conversation.id} className="bg-white text-left w-full border border-gray-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {conversation.contact.name}
                  </h3>
                  <Circle 
                    className={`w-3 h-3 ${
                      conversation.status === "running" ? "fill-green-500 text-green-500" : 
                      conversation.status === "failed" ? "fill-red-500 text-red-500" :
                      "fill-gray-500 text-gray-500"
                    }`} 
                  />
                </div>
                <p className="text-sm text-gray-500">
                  with {conversation.sales_rep.name}
                </p>
                <p className="text-sm text-gray-600">{conversation.messages[conversation.messages.length - 1].data}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{conversation.messages.length}</span>
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Conversations;