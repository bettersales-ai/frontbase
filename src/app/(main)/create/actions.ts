"use server";

import db, { salesRepTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { WhatsAppCredentials } from "@/types";


export const createSalesRep = async (name: string, sop: string, whatsapp: WhatsAppCredentials) => {
  const user = await getCurrentUser();

  if(!user) {
    throw new Error("User not authenticated");
  }

  const [salesRep] = await db
    .insert(salesRepTable)
    .values({
      sop,
      name,
      user_id: user.id,
      whatappCredentials: whatsapp,
    }).returning();

  return salesRep.id;
}