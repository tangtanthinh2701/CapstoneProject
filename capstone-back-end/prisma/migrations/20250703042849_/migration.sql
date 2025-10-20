-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('local', 'google', 'facebook');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191),
    "avatar" VARCHAR(191),
    "provider" "AuthProviderType" NOT NULL,
    "providerUserId" VARCHAR(191),
    "passwordHash" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_provider_providerUserId_key" UNIQUE ("provider", "providerUserId")
);
