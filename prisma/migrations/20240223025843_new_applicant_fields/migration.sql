-- AlterTable
ALTER TABLE "application" ADD COLUMN     "cover_letter" TEXT,
ADD COLUMN     "cover_letter_id" TEXT,
ADD COLUMN     "disability_status" TEXT,
ADD COLUMN     "hispanic_or_latino" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "non_compete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "older_than_18" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prev_employee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "race" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "resume_id" TEXT,
ADD COLUMN     "us_authorized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "veteran_status" TEXT;
