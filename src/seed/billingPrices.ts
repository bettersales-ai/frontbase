import { eq } from "drizzle-orm";

import db, { billingPricesTable } from "@/db";


(async () => {
  await db.transaction(async (tx) => {
    await Promise.all(creditPacks.map(async (pack) => {
      const { id, price } = pack;
      const [existingPack] = await tx
        .select()
        .from(billingPricesTable)
        .where(eq(billingPricesTable.id, id))

      if (!existingPack) {
        await tx
          .insert(billingPricesTable)
          .values({
            ...pack,
            id,
            price: price.toString(),
          })
      }
    }));
  });
})();

const creditPacks = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 10_000.00,
    credits: 2000,
    order: 1,
    features: [
      "Credits never expire",
      "Bulk discount applied",
      "Email support",
      "$0.0098 per credit"
    ]
  },
  {
    id: "growth",
    name: "Growth Pack",
    price: 30_000.00,
    credits: 25000,
    order: 2,
    features: [
      "Credits never expire",
      "20% bulk discount",
      "Priority support",
      "$0.00796 per credit"
    ]
  },
  {
    id: "scale",
    name: "Scale Pack",
    price: 100_000.00,
    credits: 75000,
    order: 3,
    features: [
      "Credits never expire",
      "35% bulk discount",
      "24/7 support",
      "$0.00665 per credit"
    ]
  }
];