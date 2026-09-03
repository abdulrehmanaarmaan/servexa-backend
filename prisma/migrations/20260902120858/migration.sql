/*
  Warnings:

  - The values [SSLCOMMERZ,CASH] on the enum `PaymentProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProvider_new" AS ENUM ('BKASH', 'STRIPE');
ALTER TABLE "payments" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_old";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";
DROP TYPE "public"."PaymentProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "gatewayResponse" JSONB,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
