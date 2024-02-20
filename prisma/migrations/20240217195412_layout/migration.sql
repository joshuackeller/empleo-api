/*
  Warnings:

  - You are about to drop the column `user_id` on the `password` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Layout" AS ENUM ('one', 'two', 'three', 'four', 'five');

-- DropForeignKey
ALTER TABLE "password" DROP CONSTRAINT "password_user_id_fkey";

-- DropIndex
DROP INDEX "password_user_id_key";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "layout" "Layout" NOT NULL DEFAULT 'one';

-- AlterTable
ALTER TABLE "password" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "first_name",
DROP COLUMN "last_name";
