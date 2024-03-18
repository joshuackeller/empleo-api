-- AlterTable
ALTER TABLE "application" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "eeoc_disability_status" TEXT,
ADD COLUMN     "eeoc_gender" "Gender",
ADD COLUMN     "eeoc_race" TEXT,
ADD COLUMN     "eeoc_veteran_status" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "us_authorized" BOOLEAN,
ADD COLUMN     "zip" TEXT;

-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "address_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "available_start_date_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cover_letter_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedin_url_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "note_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resume_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "state_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "us_authorized_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zip_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "disability_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eeoc_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gender_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "race_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "veteran_enabled" BOOLEAN NOT NULL DEFAULT false;
