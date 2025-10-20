/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "avatar" SET DATA TYPE TEXT,
ALTER COLUMN "providerUserId" SET DATA TYPE TEXT,
ALTER COLUMN "passwordHash" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
