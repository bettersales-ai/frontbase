"use server";

import { and, eq, asc, desc } from "drizzle-orm";

import { getCurrentUser as _getCurrentUser } from "@/utils";
import db, { billingTable, billingHistoryTable, billingPricesTable } from "@/db";


export const getBillingInfo = async () => {
  const user = await _getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const [billing] = await db
    .select()
    .from(billingTable)
    .where(eq(billingTable.user_id, user.id))

  if (!billing) {
    throw new Error("Billing information not found");
  }

  const payments = await db
    .select()
    .from(billingHistoryTable)
    .where(and(
      eq(billingHistoryTable.user_id, user.id),
      eq(billingHistoryTable.billing_id, billing.id)
    ))
    .orderBy(desc(billingHistoryTable.created_at))


  return {
    billing,
    payments,
  }
}


export const getBillingPrices = async () => {
  const prices = await db
    .select()
    .from(billingPricesTable)
    .orderBy(asc(billingPricesTable.order))

  return prices;
}

export const getCurrentUser = async () => {
  return await _getCurrentUser();
}