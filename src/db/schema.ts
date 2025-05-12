import { nanoid } from "nanoid";
import { pgTable, timestamp, varchar, jsonb, boolean } from "drizzle-orm/pg-core";

import { Message, WhatsAppCredentials } from "@/types";


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
});