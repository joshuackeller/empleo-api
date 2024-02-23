/*
  Warnings:

  - You are about to drop the column `cover_letter` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resume_id]` on the table `application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cover_letter_id]` on the table `application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "application" DROP COLUMN "cover_letter",
DROP COLUMN "resume";

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_application_id_idx" ON "file"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_application_id_id_key" ON "file"("application_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "application_resume_id_key" ON "application"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_cover_letter_id_key" ON "application"("cover_letter_id");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_cover_letter_id_fkey" FOREIGN KEY ("cover_letter_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
