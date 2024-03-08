/*
  Warnings:

  - The `employment_type` column on the `listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'seasonal', 'internship', 'contract', 'temporary');

-- AlterTable
ALTER TABLE "listing" DROP COLUMN "employment_type",
ADD COLUMN     "employment_type" "EmploymentType";
