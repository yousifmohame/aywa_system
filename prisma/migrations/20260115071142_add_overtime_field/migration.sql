/*
  Warnings:

  - You are about to drop the column `department` on the `EvaluationSetting` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[departmentId]` on the table `EvaluationSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `departmentId` to the `EvaluationSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `EvaluationSetting_department_key` ON `EvaluationSetting`;

-- AlterTable
ALTER TABLE `EvaluationSetting` DROP COLUMN `department`,
    ADD COLUMN `departmentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `department`,
    ADD COLUMN `departmentId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `EvaluationSetting_departmentId_key` ON `EvaluationSetting`(`departmentId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationSetting` ADD CONSTRAINT `EvaluationSetting_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
