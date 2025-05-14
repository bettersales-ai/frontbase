"use server";

import { eq } from "drizzle-orm";
import db, { salesRepTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { WhatsAppCredentials } from "@/types";

type Request = {
  name: string;
  sop: string;
  initial_message: string;
  whatsapp: WhatsAppCredentials;
  ideal_customer_profile: string;
  id: string;
}

export const updateSalesRep = async (req: Request) => {
  const user = await getCurrentUser();

  if(!user) {
    throw new Error("User not authenticated");
  }

  const [salesRep] = await db
    .update(salesRepTable)
    .set({
      sop: req.sop,
      name: req.name,
      whatappCredentials: req.whatsapp,
      initial_message: req.initial_message,
      ideal_customer_profile: req.ideal_customer_profile,
    })
    .where(eq(salesRepTable.id, req.id))
    .returning();

  return salesRep.id;
}

export const getSalesRep = async (id: string) => {
  const user = await getCurrentUser();

  if(!user) {
    throw new Error("User not authenticated");
  }

  const [salesRep] = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.id, id))

  return JSON.parse(JSON.stringify(salesRep)) as typeof salesRep;
}
