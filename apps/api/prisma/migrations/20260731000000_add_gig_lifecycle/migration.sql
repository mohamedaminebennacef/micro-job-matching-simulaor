-- AlterTable: Extend GigStatus enum and add completedAt to Gig
ALTER TYPE "GigStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "GigStatus" ADD VALUE 'PENDING_COMPLETION';
ALTER TYPE "GigStatus" ADD VALUE 'COMPLETED';

ALTER TABLE "Gig" ADD COLUMN "completedAt" TIMESTAMP(3);
