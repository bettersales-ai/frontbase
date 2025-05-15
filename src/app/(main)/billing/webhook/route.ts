import crypto from "node:crypto";

import { headers as NextHeaders } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { PaymentMetadata, PaystackData } from "@/types";
import db, { usersTable, billingPricesTable, billingHistoryTable, billingTable } from "@/db";


const secret = process.env.PAYSTACK_SECRET_KEY;


export async function POST(request: NextRequest) {
  const headers = await NextHeaders();

  const rawBody = await request.arrayBuffer();

  const hash = crypto
    .createHmac("sha512", secret!)
    .update(Buffer.from(rawBody))
    .digest("hex");

  const signature = headers.get("x-paystack-signature");

  if (hash != signature) {
    return NextResponse.json({
      message: "Invalid data",
    }, {
      status: 400,
    });
  }

  const data = JSON.parse(Buffer.from(rawBody).toString("utf-8")) as PaystackData;

  console.log("Received webhook data:", JSON.stringify(data, null, 2));

  if (data.event == "charge.success") {
    const { amount, reference, customer, metadata: _metadata, authorization } = data.data;

    const { plan_id } = _metadata as PaymentMetadata;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, customer.email));

    if (!user) {
      return NextResponse.json({
        message: "User not found",
      }, {
        status: 404,
      });
    }

    if (!plan_id) {
      return NextResponse.json({
        message: "Plan ID not found",
      }, {
        status: 400,
      });
    }

    const [billingPrice] = await db
      .select()
      .from(billingPricesTable)
      .where(eq(billingPricesTable.id, plan_id));

    if (!billingPrice) {
      return NextResponse.json({
        message: "Billing price not found",
      }, {
        status: 404,
      });
    }

    const [userBilling] = await db
      .select()
      .from(billingTable)
      .where(eq(billingTable.user_id, user.id))

    if (!userBilling) {
      return NextResponse.json({
        message: "Billing not found",
      }, {
        status: 404,
      });
    }

    if (amount != parseInt(billingPrice.price) * 100) {
      // Log to analytics
      console.error("Amount mismatch", {
        expected: parseInt(billingPrice.price) * 100,
        received: amount,
      });
      return NextResponse.json({
        message: "Amount mismatch",
      }, {
        status: 400,
      });
    }

    const [transaction] = await db
      .insert(billingHistoryTable)
      .values({
        reference,
        user_id: user.id,
        status: "success",
        amount: String(amount  / 100),
        billing_id: userBilling.id,
        credits_bought: billingPrice.credits,
      }).returning();

    const totalCredits = userBilling.credits_available + transaction.credits_bought;

    await db
      .update(billingTable)
      .set({
        updated_at: new Date(),
        credits_available: totalCredits,
        paystack_customer_id: customer.customer_code,
        paystack_authorization: {
          ...userBilling.paystack_authorization,
          ...authorization,
        },
      })
      .where(eq(billingTable.id, userBilling.id));

  }

  return NextResponse.json({
    res: "complete",
  });
}