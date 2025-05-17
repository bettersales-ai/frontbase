"use server";

import { revalidatePath } from "next/cache";
import { notFound, unauthorized } from "next/navigation";

import { eq, and, count } from "drizzle-orm";

import { getCurrentUser } from "@/utils";
import db, { salesRepTable, conversationsTable } from "@/db";


export const getSalesRepData = async (salesRepId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const [salesRep] = await db
    .select()
    .from(salesRepTable)
    .where(
      and(
        eq(salesRepTable.user_id, user.id),
        eq(salesRepTable.id, salesRepId),
      )
    )

  if (!salesRep) {
    notFound();
  }

  return JSON.parse(JSON.stringify(salesRep)) as typeof salesRep
}

export const getSalesRepTotalConversations = async (salesRepId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const totalConversations = await db
    .select({ count: count(conversationsTable.id) })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.user_id, user.id),
        eq(conversationsTable.sales_rep_id, salesRepId),
      )
    )

  return totalConversations[0].count
}

export const getSalesRepSuccessRate = async (salesRepId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const rates = await db
    .select({
      status: conversationsTable.status,
      count: count(conversationsTable.status),
    })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.user_id, user.id),
        eq(conversationsTable.sales_rep_id, salesRepId),
      )
    )
    .groupBy(conversationsTable.status);

  if (rates.length === 0) {
    return 0;
  }

  const totalSuccess = rates
    .filter((rate) => rate.status === "success")
    .reduce((acc, rate) => {
      return acc + rate.count;
    }, 0);
  const totalFailed = rates
    .filter((rate) => rate.status === "failed")
    .reduce((acc, rate) => {
      return acc + rate.count;
    }, 0);
  const totalRunning = rates
    .filter((rate) => rate.status === "running")
    .reduce((acc, rate) => {
      return acc + rate.count;
    }, 0);

  const totalConversations = totalSuccess + totalFailed + totalRunning;

  return ((totalSuccess + totalRunning) / totalConversations) * 100;
}

export const getSalesRepActiveConversations = async (salesRepId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const activeConversations = await db
    .select({ count: count(conversationsTable.id) })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.user_id, user.id),
        eq(conversationsTable.sales_rep_id, salesRepId),
        eq(conversationsTable.status, "running"),
      )
    )

  return activeConversations[0].count
}


export const updateSalesRepStatus = async (id: string, status: boolean) => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  await db
    .update(salesRepTable)
    .set({ is_active: status })
    .where(
      and(
        eq(salesRepTable.user_id, user.id),
        eq(salesRepTable.id, id),
      )
    )

  revalidatePath(`/agents/${id}`);
}