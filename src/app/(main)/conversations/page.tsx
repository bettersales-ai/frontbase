import React from "react";

import Link from "next/link";
import { unauthorized } from "next/navigation";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Circle } from "lucide-react";
import { eq, and, desc, InferSelectModel } from "drizzle-orm";

import { getCurrentUser } from "@/utils";
import db, { conversationsTable, contactsTable, salesRepTable } from "@/db";


interface ConversationsProps {
  searchParams: Promise<{
    salesRep?: string;
  }>
}

const Conversations = async ({ searchParams }: ConversationsProps): Promise<React.ReactElement> => {
  const { salesRep } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  let conversations: InferSelectModel<typeof conversationsTable>[] = [];

  if (!salesRep) {
    conversations = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.user_id, user.id))
      .orderBy(desc(conversationsTable.updated_at))

  } else {
    conversations = await db
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.user_id, user.id),
          eq(conversationsTable.sales_rep_id, salesRep)
        )
      )
      .orderBy(desc(conversationsTable.updated_at))
  }

  const res = await Promise.all(conversations
    .map(async (conversation) => {
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
        {res.map((conversation) => (
          <Link href={`/conversations/${conversation.id}`} key={conversation.id} className="flex flex-col gap-2 bg-white text-left w-full border border-gray-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {conversation.contact.name}
                  </h3>
                  <Circle
                    className={`w-3 h-3 ${conversation.status === "running" ? "fill-green-500 text-green-500" :
                      conversation.status === "failed" ? "fill-red-500 text-red-500" :
                        "fill-gray-500 text-gray-500"
                      }`}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  with {conversation.sales_rep.name}
                </p>
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
            <p className="text-sm text-gray-600 line-clamp-2">{conversation.messages[conversation.messages.length - 1].data}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Conversations;