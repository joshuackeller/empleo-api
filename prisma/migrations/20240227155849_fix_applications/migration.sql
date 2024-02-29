/*
  Warnings:

  - Made the column `organization_id` on table `application` required. This step will fail if there are existing NULL values in that column.
  - Made the column `listing_id` on table `application` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "application" ALTER COLUMN "organization_id" SET NOT NULL,
ALTER COLUMN "listing_id" SET NOT NULL;
