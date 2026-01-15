-- AlterTable
ALTER TABLE `DailyPerformance` ADD COLUMN `overtimeHours` DOUBLE NULL DEFAULT 0,
    MODIFY `workHours` DOUBLE NULL DEFAULT 0;
