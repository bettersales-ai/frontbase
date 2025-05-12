ALTER TABLE "sales_rep" ALTER COLUMN "sop" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "sales_rep" ADD COLUMN "initial_message" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_rep" ADD COLUMN "ideal_customer_profile" varchar(255) DEFAULT '' NOT NULL;