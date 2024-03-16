-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('doc', 'docx', 'pdf', 'png', 'jpeg', 'pages', 'unknown');

-- AlterTable
ALTER TABLE "file" ADD COLUMN     "file_type" "FileType" NOT NULL DEFAULT 'unknown';
