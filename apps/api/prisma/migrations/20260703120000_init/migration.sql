-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('OPEN', 'ASSIGNED');

-- CreateTable
CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "skills" TEXT[] NOT NULL,
    "interests" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gig" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "status" "GigStatus" NOT NULL DEFAULT 'OPEN',
    "assignedStudentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "studentId" UUID NOT NULL,
    "gigId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_gigId_score_idx" ON "Match"("gigId", "score" DESC);

-- CreateIndex
CREATE INDEX "Match_studentId_idx" ON "Match"("studentId");

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_assignedStudentId_fkey" FOREIGN KEY ("assignedStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
