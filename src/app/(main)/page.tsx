import React from "react";

import Link from "next/link";

import { PlusIcon, Power } from "lucide-react";

import { eq, desc } from "drizzle-orm";

import db, { salesRepTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { unauthorized } from "next/navigation";


const Home = async (): Promise<React.JSX.Element> => {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const sales = await db
    .select()
    .from(salesRepTable)
    .where(eq(salesRepTable.user_id, user.id))
    .orderBy(desc(salesRepTable.created_at))

  return (
    <div className="flex flex-col items-center gap-9 pt-16 pb-8 w-full h-full">
      <div className="text-center space-y-1">
        <h1 className="mb-2 text-5xl tracking-tight font-extrabold text-gray-900">Kick Ads</h1>
        <p className="text-gray-600 text-lg">Create kick-ass ads for your business</p>
      </div>

      <div className="grid grid-cols-3 gap-8 px-24 w-full h-full">
        {sales.map((salesRep) => (
          <button
            key={salesRep.id}
            className="bg-white border border-gray-200 shadow-sm rounded-lg h-[12rem] p-6 text-left transition-all hover:shadow-md"
          >
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{salesRep.name}</h3>
                  <Power className={`w-4 h-4 ${salesRep.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-3">{salesRep.sop}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {/* TODO: Conversation count <span>{salesRep.conversation_count}</span> */}
                <span>0</span>
                <span>conversations</span>
              </div>
            </div>
          </button>
        ))}
        <Link href="/create" className="bg-white border-2 border-dashed border-gray-300 flex flex-col justify-center items-center rounded-lg h-[12rem] transition-all hover:border-gray-400 hover:bg-gray-50">
          <PlusIcon className="w-12 h-12 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 mt-2">Create Sales Rep</span>
        </Link>
      </div>
    </div>
  );
};


export default Home;