CREATE SCHEMA "internal";
--> statement-breakpoint
CREATE TABLE "billing_prices" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"credits" integer NOT NULL,
	"price" numeric(1000, 2) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL
);
