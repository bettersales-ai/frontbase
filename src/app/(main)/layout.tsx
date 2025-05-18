import React from "react";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { headers as NextHeaders } from "next/headers";

import { eq } from "drizzle-orm";
import { LogSnag } from "@logsnag/next/server";
import { SetUserIdServerComponent } from "@logsnag/next";

import db, { billingTable } from "@/db";
import { getCurrentUser } from "@/utils";
import { PATHNAME_HEADER } from "@/types";

import NavBar from "./_components/NavBar";

const LOGSNAG_TOKEN = process.env.LOGSNAG_TOKEN || "";
const LOGSNAG_PROJECT = process.env.LOGSNAG_PROJECT || "";

const logsnag = new LogSnag({
  token: LOGSNAG_TOKEN,
  project: LOGSNAG_PROJECT,
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const headers = await NextHeaders();
  const user = await getCurrentUser();

  const currentRoute = headers.get(PATHNAME_HEADER);

  if (!user && !currentRoute!.startsWith("/auth")) {
    redirect("/auth/login");
  }

  after(async () => {
    const [billing] = await db
      .select()
      .from(billingTable)
      .where(eq(billingTable.user_id, user!.id));

    if (!billing) {
      throw new Error("Billing not found");
    }

    await logsnag.identify({
      user_id: user!.id,
      properties: {
        name: user!.name,
        email: user!.email,
        credits_available: billing.credits_available,
      },
    });
  });

  return (
    <div className="flex flex-col items-center w-full min-h-svh bg-gray-50">
      <SetUserIdServerComponent userId={user!.id} />
      <NavBar />
      {children}
    </div>
  );
}