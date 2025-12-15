CREATE TABLE `mentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int,
	`commentId` int,
	`mentionedUserId` int NOT NULL,
	`mentionedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `mentioned_user_idx` ON `mentions` (`mentionedUserId`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `mentions` (`postId`);--> statement-breakpoint
CREATE INDEX `comment_idx` ON `mentions` (`commentId`);