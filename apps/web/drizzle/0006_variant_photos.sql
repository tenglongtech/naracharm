ALTER TABLE "variant_images" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "variant_images" ADD COLUMN "is_product_photo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "variant_images_variant_idx" ON "variant_images" USING btree ("variant_id");