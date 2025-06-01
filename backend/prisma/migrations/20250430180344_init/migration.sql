/*
  Warnings:

  - You are about to drop the column `Mobile` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_Mobile_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Mobile",
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
