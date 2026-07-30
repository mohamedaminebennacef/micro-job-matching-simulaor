-- AlterTable: Add new columns to Gig
ALTER TABLE "Gig" ADD COLUMN "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Gig" ADD COLUMN "schedule" TEXT;
ALTER TABLE "Gig" ADD COLUMN "contact" TEXT;
