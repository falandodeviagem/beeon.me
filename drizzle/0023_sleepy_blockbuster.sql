ALTER TABLE `conversations` MODIFY COLUMN `lastMessageAt` timestamp;--> statement-breakpoint
ALTER TABLE `conversations` ADD `lastMessagePreview` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `messages` ADD `imageUrl` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `readAt` timestamp;