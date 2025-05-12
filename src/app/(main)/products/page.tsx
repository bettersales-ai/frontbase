import React from "react";

import Link from "next/link";
import { unauthorized } from "next/navigation";

import { eq, desc } from "drizzle-orm";
import { PlusIcon } from "lucide-react";

import db, { productsTable } from "@/db";
import { getCurrentUser } from "@/utils";

const Products = async (): Promise<React.JSX.Element> => {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.user_id, user.id))
    .orderBy(desc(productsTable.created_at));

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Products</h1>
        <p className="text-gray-600 text-lg">Manage your product catalog</p>
      </div>

      <div className="grid grid-cols-3 gap-8 px-24 w-full h-full">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 shadow-sm rounded-lg h-[12rem] p-6 text-left transition-all hover:shadow-md"
          >
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="text-green-600 font-medium">${product.price}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-3">{product.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Stock:</span>
                <span>{product.stock}</span>
                <span className="mx-2">•</span>
                <span>{product.category}</span>
              </div>
            </div>
          </div>
        ))}
        <Link href="/products/create" className="bg-white border-2 border-dashed border-gray-300 flex flex-col justify-center items-center rounded-lg h-[12rem] transition-all hover:border-gray-400 hover:bg-gray-50">
          <PlusIcon className="w-12 h-12 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 mt-2">Add Product</span>
        </Link>
      </div>
    </div>
  );
};

export default Products;