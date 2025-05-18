import { nanoid } from "nanoid";
import { pgTable, pgSchema, timestamp, varchar, numeric, integer, jsonb, boolean } from "drizzle-orm/pg-core";

import { PaystackData, Message, WhatsAppCredentials } from "@/types";


export const usersTable = pgTable("users", {
  picture: varchar({ length: 255 }),
  password: varchar({ length: 255 }),
  deleted_at: varchar({ length: 255 }),
  name: varchar({ length: 255 }).notNull(),
  id: varchar().primaryKey().$defaultFn(nanoid),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const salesRepTable = pgTable("sales_rep", {
  id: varchar().primaryKey().$defaultFn(nanoid),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),

  user_id: varchar()
    .notNull().references(() => usersTable.id),

  name: varchar({ length: 255 }).notNull(),
  sop: varchar({ length: 1000 }).notNull(),

  platform_id: varchar({ length: 255 }).notNull().default(""),

  initial_message: varchar({ length: 255 }).notNull().default(""),
  ideal_customer_profile: varchar({ length: 255 }).notNull().default(""),

  whatappCredentials: jsonb()
    .$type<WhatsAppCredentials>()
    .notNull()
    .default({} as WhatsAppCredentials),

  is_active: boolean().notNull().default(true),
});


export const productsTable = pgTable("products", {
  id: varchar().primaryKey().$defaultFn(nanoid),

  name: varchar({ length: 255 }).notNull(),
  price: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  stock: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),

  user_id: varchar()
    .notNull().references(() => usersTable.id),
});


export const contactsTable = pgTable("contacts", {
  id: varchar().primaryKey().$defaultFn(nanoid),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),

  user_id: varchar()
    .notNull().references(() => usersTable.id),

  name: varchar({ length: 255 }).notNull(),

  address: varchar({ length: 255 }),
  city: varchar({ length: 255 }),
  state: varchar({ length: 255 }),
  country: varchar({ length: 255 }),

  email: varchar({ length: 255 }),
  whatsapp: varchar({ length: 255 }),
});

export const conversationsTable = pgTable("conversations", {
  id: varchar().primaryKey().$defaultFn(nanoid),

  deleted_at: timestamp(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),

  user_id: varchar()
    .notNull().references(() => usersTable.id),

  sales_rep_id: varchar()
    .notNull().references(() => salesRepTable.id),

  contact_id: varchar()
    .notNull().references(() => contactsTable.id),

  messages: jsonb()
    .$type<Message[]>()
    .notNull()
    .default([]),

  status: varchar()
    .$type<"running" | "failed" | "success">()
    .notNull()
    .default("running"),

  handoff_active: boolean()
    .notNull().default(false),
});


export const billingTable = pgTable("billing", {
  credits_available: integer().notNull(),
  id: varchar().primaryKey().$defaultFn(nanoid),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  paystack_authorization: jsonb()
    .$type<PaystackData["data"]["authorization"]>()
    .default({} as PaystackData["data"]["authorization"]),
  paystack_customer_id: varchar({ length: 255 }),
  user_id: varchar().notNull().references(() => usersTable.id),
});

export const billingHistoryTable = pgTable("billing_history", {
  credits_bought: integer().notNull(),
  status: varchar({ length: 255 }).notNull(),
  reference: varchar({ length: 255 }).notNull(),
  id: varchar().primaryKey().$defaultFn(nanoid),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  amount: numeric({ precision: 1000, scale: 2 }).notNull(),
  user_id: varchar().notNull().references(() => usersTable.id),
  billing_id: varchar().notNull().references(() => billingTable.id),
});


export const internalSchema = pgSchema("kickads_internal");

export const billingPricesTable = internalSchema.table("billing_prices", {
  id: varchar().primaryKey().$defaultFn(nanoid),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),
  credits: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  order: integer().notNull().unique(),
  price: numeric({ precision: 1000, scale: 2 }).notNull(),
  features: jsonb()
    .$type<string[]>()
    .notNull()
    .default([]),
});
