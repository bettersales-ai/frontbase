"use server";

import db, { salesRepTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { WhatsAppCredentials } from "@/types";

type Request = {
  name: string;
  sop: string;
  initial_message: string;
  whatsapp: WhatsAppCredentials;
  ideal_customer_profile: string;
}

export const createSalesRep = async (req: Request) => {
  const user = await getCurrentUser();

  if(!user) {
    throw new Error("User not authenticated");
  }

  const [salesRep] = await db
    .insert(salesRepTable)
    .values({
      sop: req.sop,
      name: req.name,
      user_id: user.id,
      whatappCredentials: req.whatsapp,
      initial_message: req.initial_message,
      ideal_customer_profile: req.ideal_customer_profile,
    }).returning();

  return salesRep.id;
}