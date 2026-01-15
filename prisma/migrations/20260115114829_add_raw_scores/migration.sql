-- AlterTable
ALTER TABLE `DailyPerformance` ADD COLUMN `disciplineScore` INTEGER NULL DEFAULT 0,
    ADD COLUMN `qualityScore` INTEGER NULL DEFAULT 0,
    ADD COLUMN `speedScore` INTEGER NULL DEFAULT 0;
