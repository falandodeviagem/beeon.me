ALTER TABLE `posts` ADD `isEdited` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `editedAt` timestamp;