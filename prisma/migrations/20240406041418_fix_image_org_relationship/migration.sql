-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_banner_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_logo_id_fkey";

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
