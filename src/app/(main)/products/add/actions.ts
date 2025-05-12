"use server";

import db, { productsTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { unauthorized } from "next/navigation";

type Request = {
  name: string;
  price: string;
  image: string;
  stock: string;
  category: string;
  description: string;
}

export const createProduct = async (req: Request) => {
  const user = await getCurrentUser();

  if(!user) {
    unauthorized();
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      ...req,
      user_id: user.id,
    }).returning();

  return product.id;
}
