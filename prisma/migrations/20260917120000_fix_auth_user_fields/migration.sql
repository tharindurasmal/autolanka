-- Fix Better Auth / custom user fields that are expected by the app
ALTER TABLE "users" ADD "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD "phoneOtp" TEXT;
ALTER TABLE "users" ADD "phoneOtpExpiresAt" TIMESTAMP(3);
