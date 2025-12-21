ALTER TABLE `conversations` MODIFY COLUMN `lastMessageAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `lastMessagePreview`;--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `imageUrl`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `readAt`;