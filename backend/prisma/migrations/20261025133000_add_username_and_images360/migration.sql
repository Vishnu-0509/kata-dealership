-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "images360" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
