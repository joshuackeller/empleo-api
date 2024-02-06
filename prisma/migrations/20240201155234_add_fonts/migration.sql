-- CreateEnum
CREATE TYPE "Font" AS ENUM ('inter', 'notoSerif');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "body_font" "Font" NOT NULL DEFAULT 'inter',
ADD COLUMN     "header_font" "Font" NOT NULL DEFAULT 'inter';
