/*
  Warnings:

  - A unique constraint covering the columns `[banner_id]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "banner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organization_banner_id_key" ON "organization"("banner_id");

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
