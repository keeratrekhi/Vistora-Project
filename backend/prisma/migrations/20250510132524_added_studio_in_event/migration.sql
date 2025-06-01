/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolioQrCode` to the `UserPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolioRoute` to the `UserPortfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "coverImage",
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "eventDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserPortfolio" ADD COLUMN     "portfolioQrCode" TEXT NOT NULL,
ADD COLUMN     "portfolioRoute" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "contact" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_userId_key" ON "Event"("userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
