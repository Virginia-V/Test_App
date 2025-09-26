CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."asset_kind" AS ENUM('base', 'overlay', 'floor');--> statement-breakpoint
CREATE TYPE "public"."render_status" AS ENUM('pending', 'processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerkUserId" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"imageUrl" text,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerkUserId_unique" UNIQUE("clerkUserId")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_path" text NOT NULL,
	"panorama_id" integer NOT NULL,
	"asset_kind" "asset_kind" NOT NULL,
	"category_id" integer,
	"model_id" integer,
	"material_id" integer,
	"color_id" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_assets_combo" UNIQUE("panorama_id","asset_kind","category_id","model_id","material_id","color_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_categories_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"material_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_colors_material_name" UNIQUE("material_id","name")
);
--> statement-breakpoint
CREATE TABLE "floorOverlayCombinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_foc_asset" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "floorOverlayCombinationModels" (
	"floor_overlay_combination_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	CONSTRAINT "pk_focm" UNIQUE("floor_overlay_combination_id","model_id")
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"model_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_materials_model_name" UNIQUE("model_id","name")
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_models_category_name" UNIQUE("category_id","name")
);
--> statement-breakpoint
CREATE TABLE "panoramas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_panoramas_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "renderedPanoramaAssets" (
	"rendered_panorama_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	"role" "asset_kind" NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"opacity" real DEFAULT 1 NOT NULL,
	CONSTRAINT "uq_rpa_once" UNIQUE("rendered_panorama_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "renderedPanoramas" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_panorama_id" integer NOT NULL,
	"output_file_path" text NOT NULL,
	"signature" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"format" text DEFAULT 'webp' NOT NULL,
	"status" "render_status" DEFAULT 'succeeded' NOT NULL,
	"params" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_rendered_signature" UNIQUE("source_panorama_id","signature")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_panorama_id_panoramas_id_fk" FOREIGN KEY ("panorama_id") REFERENCES "public"."panoramas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floorOverlayCombinations" ADD CONSTRAINT "floorOverlayCombinations_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floorOverlayCombinationModels" ADD CONSTRAINT "floorOverlayCombinationModels_floor_overlay_combination_id_floorOverlayCombinations_id_fk" FOREIGN KEY ("floor_overlay_combination_id") REFERENCES "public"."floorOverlayCombinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floorOverlayCombinationModels" ADD CONSTRAINT "floorOverlayCombinationModels_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renderedPanoramaAssets" ADD CONSTRAINT "renderedPanoramaAssets_rendered_panorama_id_renderedPanoramas_id_fk" FOREIGN KEY ("rendered_panorama_id") REFERENCES "public"."renderedPanoramas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renderedPanoramaAssets" ADD CONSTRAINT "renderedPanoramaAssets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renderedPanoramas" ADD CONSTRAINT "renderedPanoramas_source_panorama_id_panoramas_id_fk" FOREIGN KEY ("source_panorama_id") REFERENCES "public"."panoramas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assets_panorama_id" ON "assets" USING btree ("panorama_id");--> statement-breakpoint
CREATE INDEX "idx_assets_kind" ON "assets" USING btree ("asset_kind");--> statement-breakpoint
CREATE INDEX "idx_assets_category_id" ON "assets" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_assets_model_id" ON "assets" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_assets_material_id" ON "assets" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "idx_assets_color_id" ON "assets" USING btree ("color_id");--> statement-breakpoint
CREATE INDEX "idx_colors_material_id" ON "colors" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "idx_foc_asset_id" ON "floorOverlayCombinations" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_focm_model_id" ON "floorOverlayCombinationModels" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_materials_model_id" ON "materials" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_models_category_id" ON "models" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_rpa_asset" ON "renderedPanoramaAssets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_rendered_source" ON "renderedPanoramas" USING btree ("source_panorama_id");