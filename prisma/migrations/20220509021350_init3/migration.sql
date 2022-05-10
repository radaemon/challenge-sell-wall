/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_tokenId_fkey";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_tokenId_key" ON "Listing"("tokenId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_slug_fkey" FOREIGN KEY ("slug") REFERENCES "Collection"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
