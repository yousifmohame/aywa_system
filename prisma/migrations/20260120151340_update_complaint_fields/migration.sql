/*
  Warnings:

  - Added the required column `clientType` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionType` to the `Complaint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Complaint` ADD COLUMN `clientType` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderNumber` VARCHAR(191) NULL,
    ADD COLUMN `serviceType` VARCHAR(191) NOT NULL,
    ADD COLUMN `submissionType` VARCHAR(191) NOT NULL,
    MODIFY `content` TEXT NULL;
