ALTER TABLE "users" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "colors" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "colors" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "floorOverlayCombinations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "floorOverlayCombinations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "panoramas" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "panoramas" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "renderedPanoramas" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "renderedPanoramas" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "assets" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "assets" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "colors" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "colors" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "floorOverlayCombinations" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "floorOverlayCombinations" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "panoramas" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "panoramas" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "renderedPanoramas" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "renderedPanoramas" DROP COLUMN "updatedAt";