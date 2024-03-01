/*
  Warnings:

  - You are about to drop the column `url` on the `file` table. All the data in the column will be lost.
  - Added the required column `name` to the `file` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3_key` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" DROP COLUMN "url",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "s3_key" TEXT NOT NULL;
