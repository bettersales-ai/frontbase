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
  sop: varchar({ length: 255 }).notNull(),

  whatappCredentials: jsonb()
    .$type<WhatsAppCredentials>()
    .notNull()
    .default({} as WhatsAppCredentials),

  is_active: boolean().notNull().default(true),
});

