-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('BOOLEAN', 'MULTIVARIATE');

-- AlterTable: Add new columns to flags
ALTER TABLE "flags" ADD COLUMN IF NOT EXISTS "type" "FlagType" NOT NULL DEFAULT 'BOOLEAN';
ALTER TABLE "flags" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'Production';
ALTER TABLE "flags" ADD COLUMN IF NOT EXISTS "variants" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "flags" ADD COLUMN IF NOT EXISTS "default_variant_id" TEXT;
ALTER TABLE "flags" ADD COLUMN IF NOT EXISTS "off_variant_id" TEXT;

-- Drop old unique index and create new one with environment
DROP INDEX IF EXISTS "flags_project_id_key_key";
CREATE UNIQUE INDEX IF NOT EXISTS "flags_project_id_key_environment_key" ON "flags"("project_id", "key", "environment");

-- CreateTable
CREATE TABLE IF NOT EXISTS "evaluation_events" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "flag_key" TEXT NOT NULL,
    "evaluation_result" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency" INTEGER NOT NULL DEFAULT 0,
    "environment" TEXT NOT NULL DEFAULT 'Production',
    "user_id" TEXT,

    CONSTRAINT "evaluation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL DEFAULT 'flag',
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "evaluation_events_project_id_timestamp_idx" ON "evaluation_events"("project_id", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_project_id_timestamp_idx" ON "audit_logs"("project_id", "timestamp");

-- AddForeignKey
ALTER TABLE "evaluation_events" ADD CONSTRAINT "evaluation_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
