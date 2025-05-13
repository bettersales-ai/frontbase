"use server";

import crypto from "node:crypto";

import React from "react";
import { redirect } from "next/navigation";

import { google } from "googleapis";
import { render } from "@react-email/components";

import mail from "@/mail";
import cache from "@/cache";
import { getBaseUrl } from "@/utils";
import AuthOtp from "@/mail/components/AuthOtp";


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URL = process.env.GOOGLE_CLIENT_REDIRECT_URL || "";


export const createGoogleAuthUrl = async () => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString("hex");
  await cache.set(`google-auth-state:${state}`, "true", { EX: 5 * 60 });

  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // "online" (default) or "offline" (gets refresh_token)
    access_type: "offline",
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: state
  });

  return authorizationUrl;
}

export const redirectUserToLogin = async () => {
  const url = await createGoogleAuthUrl();

  redirect(url);
}

const generateEmailVerificationCode = async (email: string) => {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const cacheKey = `email-verification-code:${code}`;
  await cache.set(cacheKey, email, { EX: 5 * 60 });

  return code;
}


export const sendEmailVerification = async (email: string) => {
  const code = await generateEmailVerificationCode(email);
  const emailHtml = await render(React.createElement(AuthOtp, { loginCode: code }));

  try {
    await mail.sendMail({
      to: email,
      html: emailHtml,
      subject: "Hello world",
      from: "Acme <onboarding@resend.dev>",
    });

    const baseUrl = await getBaseUrl();
    const url = new URL("/auth/code", baseUrl);
    console.log("URL", url.toString());

    redirect(url.toString());
  } catch (error) {
    console.error(error);
    return { message: "Error sending email" }
  }
}