ALTER TABLE "orders" ADD COLUMN "account_user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_user_id_user_id_fk" FOREIGN KEY ("account_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_account_created_idx" ON "orders" USING btree ("account_user_id","created_at","id");