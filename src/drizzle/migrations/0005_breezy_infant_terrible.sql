CREATE TABLE "renderedImageAssets" (
	"rendered_image_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	"role" "asset_kind" NOT NULL,
	CONSTRAINT "uq_ria_once" UNIQUE("rendered_image_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "renderedImages" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_panorama_id" integer NOT NULL,
	"s3_key" text NOT NULL,
	"signature" text NOT NULL,
	"format" text DEFAULT 'png' NOT NULL,
	"status" "render_status" DEFAULT 'succeeded' NOT NULL,
	"params" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_ri_source_signature" UNIQUE("source_panorama_id","signature")
);
--> statement-breakpoint
ALTER TABLE "renderedImageAssets" ADD CONSTRAINT "renderedImageAssets_rendered_image_id_renderedImages_id_fk" FOREIGN KEY ("rendered_image_id") REFERENCES "public"."renderedImages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renderedImageAssets" ADD CONSTRAINT "renderedImageAssets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renderedImages" ADD CONSTRAINT "renderedImages_source_panorama_id_panoramas_id_fk" FOREIGN KEY ("source_panorama_id") REFERENCES "public"."panoramas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ria_asset" ON "renderedImageAssets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_ri_source" ON "renderedImages" USING btree ("source_panorama_id");