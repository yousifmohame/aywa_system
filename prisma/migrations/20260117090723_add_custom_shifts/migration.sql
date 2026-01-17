-- AlterTable
ALTER TABLE `DailyPerformance` ADD COLUMN `delayMinutes` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `customEndTime` VARCHAR(191) NULL,
    ADD COLUMN `customStartTime` VARCHAR(191) NULL;
