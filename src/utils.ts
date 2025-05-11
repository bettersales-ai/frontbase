"import server-only";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { headers, cookies as NextCookies } from "next/headers";

import { eq } from "drizzle-orm";

import db, { usersTable } from "@/db";
import { IUser, AUTH_COOKIE_NAME } from "@/types";


const secret = process.env.JWT_SECRET;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export interface JWTUser<T = undefined> extends jwt.JwtPayload {
  id: string;
  data: T;
};

export const generateToken = <T = undefined>(user: JWTUser<T>) => {
  if (!secret) {
    throw new Error("JWT secret not defined")
  }
  return jwt.sign(user, secret, {
    expiresIn: "365d",
  });
};


export const verifyToken = <T = undefined>(token: string): JWTUser<T> | null => {
  if (!secret) {
    throw new Error("JWT secret not defined");
  }
  try {
    return jwt.verify(token, secret) as JWTUser<T>;
  } catch (err) {
    console.error(err);
    return null;
  }
};


export const getBaseUrl = async () => {
  // Get the host from headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  // Create a base URL
  const baseUrl = `${protocol}://${host}`;

  return baseUrl;
}

export const getCurrentUser = async (): Promise<IUser | null> => {
  const cookies = await NextCookies();
  const token = cookies.get(AUTH_COOKIE_NAME);
  if (!token) return null;

  const res = verifyToken(token.value);
  if (!res) return null;

  const user = await getUser(res.id);
  return user;
}

export const getUser = async (userId: string): Promise<IUser | null> => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (user.length === 0) return null;

  return {
    id: user[0].id,
    name: user[0].name,
    email: user[0].email,
  }
}