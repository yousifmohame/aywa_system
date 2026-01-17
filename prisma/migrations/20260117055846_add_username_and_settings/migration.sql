-- CreateTable
CREATE TABLE `SystemSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'settings',
    `workStartTime` VARCHAR(191) NOT NULL DEFAULT '07:00',
    `workEndTime` VARCHAR(191) NOT NULL DEFAULT '17:00',
    `lateThreshold` INTEGER NOT NULL DEFAULT 15,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
