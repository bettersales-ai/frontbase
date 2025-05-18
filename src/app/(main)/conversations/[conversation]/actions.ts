"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";

import { eq } from "drizzle-orm";

import { getCurrentUser } from "@/utils";
import { UserConversation, sendMessage, showTypingIndicator } from "@/chat/whatsapp";
import db, { conversationsTable, contactsTable, salesRepTable } from "@/db";


export const toggleHandoff = async (conversationId: string, status: boolean) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  await db
    .update(conversationsTable)
    .set({ handoff_active: status })
    .where(eq(conversationsTable.id, conversationId));

  revalidatePath(`/conversations/${conversationId}`);
}

export const sendWhatsappMessage = async (conversationId: string, salesRepId: string, message: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));

  if (!conversation) {
    throw new Error("Conversation does not exist");
  }

  const [salesRep] = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.id, salesRepId));

  if (!salesRep) {
    throw new Error("Sales rep does not exist");
  }

  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, conversation.contact_id));

  if (!contact) {
    throw new Error("Contact does not exist");
  }

  const whatsappRes = await sendMessage({
    to: contact.whatsapp!,
    type: "text",
    messaging_product: "whatsapp",
    text: {
      body: message,
      preview_url: false,
    },
  }, salesRep.whatappCredentials.phoneNumberId, salesRep.whatappCredentials.accessToken);

  await UserConversation.addMessageToConversation(
    conversationId,
    whatsappRes.messages[0].id,
    "agent",
    message,
  );

  revalidatePath(`/conversations/${conversationId}`);
}


export const showTypingIndicatorOnWhatsapp = async (platformId: string, salesRepId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const [salesRep] = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.id, salesRepId));

  if (!salesRep) {
    throw new Error("Sales rep does not exist");
  }

  console.log(salesRep);
  console.log(platformId);


  await showTypingIndicator(
    salesRep.whatappCredentials.phoneNumberId,
    platformId,
    salesRep.whatappCredentials.accessToken,
  );
}


export const endConversation = async (conversationId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));

  if (!conversation) {
    throw new Error("Conversation does not exist");
  }

  const [salesRep] = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.id, conversation.sales_rep_id));

  if (!salesRep) {
    throw new Error("Sales rep does not exist");
  }

  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, conversation.contact_id));

  if (!contact) {
    throw new Error("Contact does not exist");
  }

  await UserConversation.endUserConversation(
    contact.whatsapp!,
    salesRep,
  );
}