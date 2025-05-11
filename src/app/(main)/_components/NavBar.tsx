import React from "react";

import Link from "next/link";

import { Coins, CircleUserRound } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { getCurrentUser } from "@/utils";


const NavBar = async (): Promise<React.ReactElement> => {
  const user = await getCurrentUser();

  return (
    <nav className="flex flex-row-reverse items-center justify-between w-full px-16 py-8">
      <div className="flex items-center gap-2">
        <Link href="/history" className="px-3 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-200">
          History
        </Link>
        <Link href="/billing" className="px-3 py-2 flex gap-2.5 items-center text-sm text-gray-500 font-semibold rounded-lg hover:bg-gray-200">
          <Coins className="w-5 h-5 text-gray-500" />
          118
        </Link>

        {user ? (
          <Menu>
            <MenuButton className="outline-none">
              <CircleUserRound className="w-10 h-10 p-2 rounded-lg text-gray-500 hover:bg-gray-200" />
            </MenuButton>
            <MenuItems transition anchor="bottom end" className="w-[8rem] origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0">
              <MenuItem>
                <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                  Logout
                  <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘E</kbd>
                </button>
              </MenuItem>
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