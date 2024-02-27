/*
  Warnings:

  - You are about to drop the column `application_id` on the `file` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,id]` on the table `file` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_application_id_fkey";

-- DropIndex
DROP INDEX "file_application_id_id_key";

-- DropIndex
DROP INDEX "file_application_id_idx";

-- AlterTable
ALTER TABLE "file" DROP COLUMN "application_id",
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "file_organization_id_idx" ON "file"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_organization_id_id_key" ON "file"("organization_id", "id");

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
