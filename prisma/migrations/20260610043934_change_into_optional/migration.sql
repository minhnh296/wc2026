-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_positionCode_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "positionCode" DROP NOT NULL,
ALTER COLUMN "countryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_positionCode_fkey" FOREIGN KEY ("positionCode") REFERENCES "Position"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
