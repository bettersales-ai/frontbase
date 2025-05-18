CREATE SCHEMA "kickads_internal";
--> statement-breakpoint
CREATE TABLE "billing_history" (
	"credits_bought" integer NOT NULL,
	"status" varchar(255) NOT NULL,
	"reference" varchar(255) NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"amount" numeric(1000, 2) NOT NULL,
	"user_id" varchar NOT NULL,
	"billing_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kickads_internal"."billing_prices" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"credits" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"price" numeric(1000, 2) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "billing_prices_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"credits_available" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paystack_authorization" jsonb DEFAULT '{}'::jsonb,
	"paystack_customer_id" varchar(255),
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(255),
	"email" varchar(255),
	"whatsapp" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar NOT NULL,
	"sales_rep_id" varchar NOT NULL,
	"contact_id" varchar NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar DEFAULT 'running' NOT NULL,
	"handoff_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"stock" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_rep" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"sop" varchar(1000) NOT NULL,
	"platform_id" varchar(255) DEFAULT '' NOT NULL,
	"initial_message" varchar(255) DEFAULT '' NOT NULL,
	"ideal_customer_profile" varchar(255) DEFAULT '' NOT NULL,
	"whatappCredentials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"picture" varchar(255),
	"password" varchar(255),
	"deleted_at" varchar(255),
	"name" varchar(255) NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_billing_id_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "public"."billing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sales_rep_id_sales_rep_id_fk" FOREIGN KEY ("sales_rep_id") REFERENCES "public"."sales_rep"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_rep" ADD CONSTRAINT "sales_rep_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;