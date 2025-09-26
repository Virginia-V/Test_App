ALTER TABLE "renderedPanoramas" ALTER COLUMN "format" SET DEFAULT 'png';--> statement-breakpoint
ALTER TABLE "renderedPanoramaAssets" DROP COLUMN "z_index";--> statement-breakpoint
ALTER TABLE "renderedPanoramaAssets" DROP COLUMN "opacity";--> statement-breakpoint
ALTER TABLE "renderedPanoramas" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "renderedPanoramas" DROP COLUMN "height";