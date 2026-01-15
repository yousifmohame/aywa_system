-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `role` ENUM('MANAGER', 'SUPERVISOR', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `department` ENUM('CUSTOMER_SERVICE', 'ORDER_FULFILLMENT') NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyPerformance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `callsCount` INTEGER NULL DEFAULT 0,
    `solvedTickets` INTEGER NULL DEFAULT 0,
    `pendingTickets` INTEGER NULL DEFAULT 0,
    `avgResponseTime` INTEGER NULL,
    `ordersPrepared` INTEGER NULL DEFAULT 0,
    `accuracyRate` INTEGER NULL DEFAULT 100,
    `returnedOrders` INTEGER NULL DEFAULT 0,
    `avgPrepTime` INTEGER NULL,

    UNIQUE INDEX `DailyPerformance_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NULL,
    `assignedToId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationSetting` (
    `id` VARCHAR(191) NOT NULL,
    `department` ENUM('CUSTOMER_SERVICE', 'ORDER_FULFILLMENT') NOT NULL,
    `speedWeight` INTEGER NOT NULL DEFAULT 30,
    `accuracyWeight` INTEGER NOT NULL DEFAULT 30,
    `qualityWeight` INTEGER NOT NULL DEFAULT 20,
    `disciplineWeight` INTEGER NOT NULL DEFAULT 20,

    UNIQUE INDEX `EvaluationSetting_department_key`(`department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Note` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
