import React from "react";

import Link from "next/link";

import { eq } from "drizzle-orm";
import { Coins, CircleUserRound } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import db, { billingTable } from "@/db";
import { getCurrentUser } from "@/utils";


const NavBar = async (): Promise<React.ReactElement> => {
  let credits = NaN;
  const user = await getCurrentUser();

  if (user) {
    const [billing] = await db
      .select()
      .from(billingTable)
      .where(eq(billingTable.user_id, user.id));

    if (billing) {
      credits = billing.credits_available;
    }
  }


  return (
    <nav className="flex items-center justify-between w-full px-16 py-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-gray-500 hover:text-gray-700">
          Kick Ads
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {/* Disabling this feature for now */}
        {/* <Link href="/products" className="px-3 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-200">
          Products
        </Link> */}
        <Link href="/conversations" className="px-3 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-200">
          Conversations
        </Link>
        <Link href="/billing" className="px-3 py-2 flex gap-2.5 items-center text-sm text-gray-500 font-semibold rounded-lg hover:bg-gray-200">
          <Coins className="w-5 h-5 text-gray-500" />
          {!Number.isNaN(credits) && credits.toLocaleString()}
        </Link>

        {user ? (
          <Menu>
            <MenuButton className="outline-none">
              <CircleUserRound className="w-10 h-10 p-2 rounded-lg text-gray-500 hover:bg-gray-200" />
            </MenuButton>
            <MenuItems transition anchor="bottom end" className="origin-top-right rounded-xl border text-gray-500 border-white/5 bg-white p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0">
              <MenuItem>
                <button className="text-left flex w-full items-center gap-2 rounded-lg px-3 py-1.5">
                  Logout
                </button>
              </MenuItem>
              {/* Disabling this feature for now */}
              {/* <MenuItem>
                <button className="text-left flex w-full items-center gap-2 rounded-lg px-3 py-1.5">
                  Export Customers
                </button>
              </MenuItem> */}
            </MenuItems>
          </Menu>
        ) : (
          <Link href="/auth/login" className="px-3 py-2 flex gap-2.5 items-center text-sm text-gray-500 font-semibold rounded-lg hover:bg-gray-200">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
};


export default NavBar;