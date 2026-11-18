-- Some deployments created the feedback tables manually. Keep tracked migrations
-- usable for both those databases and fresh installs.
CREATE TABLE IF NOT EXISTS "blog_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_slug" text NOT NULL,
  "author_name" text NOT NULL,
  "email" text,
  "text" text NOT NULL,
  "is_approved" boolean DEFAULT false NOT NULL,
  "parent_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "customer_id" uuid,
  "author_name" text NOT NULL,
  "rating" integer DEFAULT 5 NOT NULL,
  "title" text,
  "text" text NOT NULL,
  "is_verified_purchase" boolean DEFAULT false NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade,
  CONSTRAINT "product_reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_article_idx" ON "blog_comments" USING btree ("article_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_approved_idx" ON "blog_comments" USING btree ("is_approved");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "product_reviews" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_featured_idx" ON "product_reviews" USING btree ("is_featured");
--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_product_photo" boolean DEFAULT false NOT NULL;
