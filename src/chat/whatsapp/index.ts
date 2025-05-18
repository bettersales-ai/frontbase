import { eq, type InferSelectModel } from "drizzle-orm";

import db, { contactsTable, billingTable, conversationsTable, salesRepTable } from "@/db";

import { redis } from "@/cache";
import { Message } from "@/types";
import { Contact, ContactConversation } from "./types";
import { publishMessageToConversation } from "../pubsub";

export * from "./utils";

export class UserConversation {
  private static nullValue = "null";

  private static async getSalesRep(salesRepId: string) {
    const [salesRep] = await db
      .select()
      .from(salesRepTable)
      .where(eq(salesRepTable.id, salesRepId));

    if (!salesRep) {
      throw new Error("Sales rep does not exist");
    }

    if (!salesRep.is_active) {
      throw new Error("Sales rep is not active");
    }

    const [billing] = await db
      .select()
      .from(billingTable)
      .where(eq(billingTable.user_id, salesRep.user_id));

    if (!billing) {
      throw new Error("Billing does not exist");
    }

    if (billing.credits_available <= 0) {
      throw new Error("User does not have enough credits");
    }

    return salesRep;
  }

  public static async addMessageToConversation(conversationId: string, messageId: string, sender: Message["sender"], message: string) {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))

    if (!conversation) {
      throw new Error("Conversation does not exist");
    }

    await publishMessageToConversation(
      conversation.id,
      {
        sender,
        type: "text",
        data: message,
        timestamp: Date.now(),
        platform_id: messageId,
      },
    );

    await db
      .update(conversationsTable)
      .set({
        messages: [
          ...conversation.messages,
          {
            sender,
            type: "text",
            data: message,
            timestamp: Date.now(),
            platform_id: messageId,
          }
        ]
      })
      .where(eq(conversationsTable.id, conversationId));

    // revalidatePath(`/conversations/${conversationId}`);
  }

  public static async getUserConversationId(contact: Contact, sales_rep: string) {
    const key = `contacts:${contact.wa_id}:conversation`;

    const data = await redis.get(key);

    const salesRep = await UserConversation.getSalesRep(sales_rep);

    // If this does not exist, then this is a new contact
    // If it exists value in null, then it previously had a convo
    if (!data) {
      const [newContact] = await db
        .insert(contactsTable)
        .values({
          name: contact.profile.name,
          whatsapp: contact.wa_id,
          user_id: salesRep.user_id,
        }).returning();

      const [conversation] = await db
        .insert(conversationsTable)
        .values({
          user_id: salesRep.user_id,
          sales_rep_id: sales_rep,
          contact_id: newContact.id,
        }).returning();

      await redis.set(key, JSON.stringify({
        contactId: newContact.id,
        currentConversation: conversation.id,
      } as ContactConversation));

      return {
        contact,
        salesRep,
        conversation,
        isNewConversation: true,
      };
    }

    const contactConversation = JSON.parse(data) as ContactConversation;
    if (contactConversation.currentConversation == UserConversation.nullValue) {
      const [conversation] = await db
        .insert(conversationsTable)
        .values({
          sales_rep_id: sales_rep,
          user_id: salesRep.user_id,
          contact_id: contactConversation.contactId,
        }).returning();

      contactConversation.currentConversation = conversation.id;
      await redis.set(key, JSON.stringify(contactConversation));
      return {
        contact,
        salesRep,
        conversation,
        isNewConversation: true,
      };
    } else {
      const [conversation] = await db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.id, contactConversation.currentConversation));

      if (!conversation) {
        throw new Error(`Conversation ${contactConversation.currentConversation} does not exist`);
      }

      return {
        contact,
        salesRep,
        conversation,
        isNewConversation: false,
      };
    }
  }

  public static async endUserConversation(wa_id: string, salesRep: InferSelectModel<typeof salesRepTable>): Promise<void> {
    const key = `contacts:${wa_id}:conversation`;
    const data = await redis.get(key);

    if (!data) {
      throw new Error("Contact has no conversation");
    }

    // deduct one credit from the user
    const [billing] = await db
      .select()
      .from(billingTable)
      .where(eq(billingTable.user_id, salesRep.user_id));

    if (!billing) {
      throw new Error("Billing does not exist");
    }

    if (billing.credits_available <= 0) {
      throw new Error("User does not have enough credits");
    }

    await db
      .update(billingTable)
      .set({ credits_available: billing.credits_available - 1 })
      .where(eq(billingTable.user_id, salesRep.user_id));

    const contactConversation = JSON.parse(data) as ContactConversation;

    // TODO: Write a function that summarizes the conversation
    // and tell if it was successful or not

    await db
      .update(conversationsTable)
      .set({ status: "success" })
      .where(eq(conversationsTable.id, contactConversation.currentConversation));

    contactConversation.currentConversation = UserConversation.nullValue;
    await redis.set(`contacts:${wa_id}:conversation`, JSON.stringify(contactConversation));
  }
}