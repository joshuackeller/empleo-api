/*
  Warnings:

  - You are about to drop the column `address` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `disability_status` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `hispanic_or_latino` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `non_compete` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `older_than_18` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `prev_employee` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `relocate` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `us_authorized` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `us_citizen` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `veteran_status` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `work_visa` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `work_visa_type` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "application" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "disability_status",
DROP COLUMN "gender",
DROP COLUMN "hispanic_or_latino",
DROP COLUMN "language",
DROP COLUMN "non_compete",
DROP COLUMN "older_than_18",
DROP COLUMN "prev_employee",
DROP COLUMN "race",
DROP COLUMN "relocate",
DROP COLUMN "state",
DROP COLUMN "us_authorized",
DROP COLUMN "us_citizen",
DROP COLUMN "veteran_status",
DROP COLUMN "work_visa",
DROP COLUMN "work_visa_type",
DROP COLUMN "zip";
