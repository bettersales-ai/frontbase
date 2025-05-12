ALTER TABLE "sales_rep" ALTER COLUMN "whatappCredentials" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "sales_rep" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_rep" ADD CONSTRAINT "sales_rep_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;