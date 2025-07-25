import { revalidatePath } from "next/cache";
import { cookies as NextCookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { google } from "googleapis";
import { LogSnag } from "@logsnag/next/server";
import { eq, InferSelectModel } from "drizzle-orm";

import cache from "@/cache";
import { AUTH_COOKIE_NAME } from "@/types";
import db, { usersTable, billingTable } from "@/db";
import { generateToken, getBaseUrl } from "@/utils";


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const LOGSNAG_TOKEN = process.env.LOGSNAG_TOKEN || "";
const LOGSNAG_PROJECT = process.env.LOGSNAG_PROJECT || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URL = process.env.GOOGLE_CLIENT_REDIRECT_URL || "";

const logsnag = new LogSnag({
  token: LOGSNAG_TOKEN,
  project: LOGSNAG_PROJECT,
});

export async function GET(request: NextRequest) {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return new Response("Invalid code or state", {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  const isValidState = await cache.get(`google-auth-state:${state}`);
  if (!isValidState) {
    return new Response("Invalid state", {
      status: 400,
    });
  }
  await cache.del(`google-auth-state:${state}`);

  // Get google user profile
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  if (!data) {
    return new Response("User not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Check if user exists
  const user = (await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email!)))[0];

  if (!user) {
    return await handleSignUp(request, data.name!, data.email!);
  } else {
    return await handleSignIn(request, user);
  }
}

const handleSignUp = async (request: NextRequest, name: string, email: string) => {
  const cookies = await NextCookies();
  const isDev = process.env.NODE_ENV === "development";

  const [user] = await db
    .insert(usersTable)
    .values({ name, email })
    .returning();

  await db
    .insert(billingTable)
    .values({
      user_id: user.id,
      credits_available: 0,
    });

  await logsnag.track({
    channel: "onboarding",
    event: `${user.name} just signed up!`,
    notify: true,
    user_id: user.id,
    tags: {
      method: "google",
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
  const baseUrl = await getBaseUrl();
  return NextResponse.redirect(new URL("/", baseUrl));
}

const handleSignIn = async (request: NextRequest, user: InferSelectModel<typeof usersTable>) => {
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
  const baseUrl = await getBaseUrl();
  return NextResponse.redirect(new URL("/", baseUrl));
}