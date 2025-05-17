import React from "react";

import { eq } from "drizzle-orm";
import db, { conversationsTable, contactsTable, salesRepTable } from "@/db";

import ChatWindow from "./_components/ChatWindow";
import { notFound } from "next/navigation";

interface ConversationProps {
  params: Promise<{
    conversation: string;
  }>
}

const Conversation = async ({ params }: ConversationProps): Promise<React.ReactElement> => {
  const { conversation: conversationId } = await params;

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));


  if (!conversation) {
    notFound();
  }

  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, conversation.contact_id));

  if (!contact) {
    notFound();
  }

  const [sales_rep] = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.id, conversation.sales_rep_id));
  if (!sales_rep) {
    notFound();
  }


  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full relative">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">{sales_rep.name} x {contact.name}</h1>
        <p className="text-gray-600 text-lg">{conversation.created_at.toLocaleDateString()}</p>
      </div>

      <ChatWindow messages={conversation.messages} />

      <button className="fixed bottom-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors">
        Jump In!
      </button>
    </div>
  );
};


export default Conversation;