-- set default (no IF EXISTS form for this in Postgres)
ALTER TABLE "renderedPanoramas" ALTER COLUMN "format" SET DEFAULT 'png';

-- add s3_key as nullable (so it won’t break on existing rows)
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "s3_key" text;

-- drop columns safely if they exist
ALTER TABLE "renderedPanoramaAssets" DROP COLUMN IF EXISTS "z_index";
ALTER TABLE "renderedPanoramaAssets" DROP COLUMN IF EXISTS "opacity";
ALTER TABLE "renderedPanoramas" DROP COLUMN IF EXISTS "width";
ALTER TABLE "renderedPanoramas" DROP COLUMN IF EXISTS "height";
