-- CreateTable
CREATE TABLE "listing" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "job_title" TEXT NOT NULL,
    "location" TEXT,
    "employment_type" TEXT,
    "salary_range" TEXT,
    "job_description" TEXT,
    "job_requirements" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_organization_id_idx" ON "listing"("organization_id");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
