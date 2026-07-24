-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- AlterTable: Add new columns to Student
ALTER TABLE "Student" ADD COLUMN "availability" TEXT;
ALTER TABLE "Student" ADD COLUMN "preferredWorkTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable: Add createdById to Gig
ALTER TABLE "Gig" ADD COLUMN "createdById" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
