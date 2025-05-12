import { nanoid } from "nanoid";
import { pgTable, timestamp, varchar, jsonb, boolean } from "drizzle-orm/pg-core";

import { WhatsAppCredentials } from "@/types";


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

