ALTER TABLE `comments` ADD `isEdited` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD `editedAt` timestamp;