"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies as NextCookies } from "next/headers";

import { eq, InferSelectModel } from "drizzle-orm";
import { LogSnag } from "@logsnag/next/server";

import cache from "@/cache";
import { generateToken } from "@/utils";
import { AUTH_COOKIE_NAME } from "@/types";
import db, { usersTable, billingTable } from "@/db";


const LOGSNAG_TOKEN = process.env.LOGSNAG_TOKEN || "";
const LOGSNAG_PROJECT = process.env.LOGSNAG_PROJECT || "";

const logsnag = new LogSnag({
  token: LOGSNAG_TOKEN,
  project: LOGSNAG_PROJECT,
});

export const verifyCode = async (code: string) => {
  const cacheKey = `email-verification-code:${code}`;
  const data = await cache.get(cacheKey);

  if (!data) {
    throw new Error("Invalid or expired code");
  }

  const { email, extraData } = JSON.parse(data) as {
    email: string;
    extraData?: Record<string, string>;
  };

  await cache.del(cacheKey);
  // Check if user exists
  const user = (await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email!)))[0];

  if (!user) {
    return await handleSignUp(extraData!.name, email!);
  } else {
    return await handleSignIn(user);
  }
}


const handleSignUp = async (name: string, email: string) => {
  const cookies = await NextCookies();
  const isDev = process.env.NODE_ENV === "development";

  const user = (await db
    .insert(usersTable)
    .values({
      name,
      email,
    }).returning())[0];

  await logsnag.track({
    channel: "onboarding",
    event: `${name} just signed up!`,
    notify: true,
    user_id: user.id,
    tags: {
      method: "email",
    }
  });

  await logsnag.identify({
    user_id: user.id,
    properties: {
      name: user.name,
      email: user.email,
      credits_available: 0,
    },
  });

  await logsnag.insight.increment({
    title: "User count",
    value: 1,
    icon: "👨",
  });

  await db
    .insert(billingTable)
    .values({
      user_id: user.id,
      credits_available: 0,
    });

  const token = generateToken({
    id: user.id,
    data: undefined
  });

  cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    secure: !isDev,
    // maxAge: 60 * 60 * 24,
    httpOnly: isDev ? false : true,
    sameSite: isDev ? "lax" : "none",
  });

  revalidatePath("/");
  return redirect("/");
}

const handleSignIn = async (user: InferSelectModel<typeof usersTable>) => {
  const cookies = await NextCookies();
  const isDev = process.env.NODE_ENV === "development";

  const token = generateToken({
    id: user.id,
    data: undefined
  });

  cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    secure: !isDev,
    // maxAge: 60 * 60 * 24,
    httpOnly: isDev ? false : true,
    sameSite: isDev ? "lax" : "none",
  });

  await logsnag.identify({
    user_id: user.id,
    properties: {
      name: user.name,
      email: user.email,
    },
  });

  revalidatePath("/");
  return redirect("/");
}
