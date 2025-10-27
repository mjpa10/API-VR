-- CreateTable
CREATE TABLE `Usuario` (
    `NomeID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_Email_key`(`Email`),
    PRIMARY KEY (`NomeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resultado` (
    `ResultadoID` INTEGER NOT NULL AUTO_INCREMENT,
    `Pontuacao` INTEGER NOT NULL,
    `Data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Acertos` INTEGER NOT NULL,
    `Erros` INTEGER NOT NULL,
    `NomeID` INTEGER NOT NULL,

    PRIMARY KEY (`ResultadoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `TokenID` INTEGER NOT NULL AUTO_INCREMENT,
    `Token` VARCHAR(255) NOT NULL,
    `ExpiresAt` DATETIME(3) NOT NULL,
    `Used` BOOLEAN NOT NULL DEFAULT false,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `NomeID` INTEGER NOT NULL,

    UNIQUE INDEX `PasswordResetToken_Token_key`(`Token`),
    INDEX `PasswordResetToken_Token_idx`(`Token`),
    PRIMARY KEY (`TokenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resultado` ADD CONSTRAINT `Resultado_NomeID_fkey` FOREIGN KEY (`NomeID`) REFERENCES `Usuario`(`NomeID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_NomeID_fkey` FOREIGN KEY (`NomeID`) REFERENCES `Usuario`(`NomeID`) ON DELETE CASCADE ON UPDATE CASCADE;
