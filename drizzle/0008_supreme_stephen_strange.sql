CREATE TABLE `hashtags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tag` varchar(100) NOT NULL,
	`useCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hashtags_id` PRIMARY KEY(`id`),
	CONSTRAINT `hashtags_tag_unique` UNIQUE(`tag`)
);
--> statement-breakpoint
CREATE TABLE `post_hashtags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`hashtagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_hashtags_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_hashtag_idx` UNIQUE(`postId`,`hashtagId`)
);
--> statement-breakpoint
CREATE INDEX `tag_idx` ON `hashtags` (`tag`);--> statement-breakpoint
CREATE INDEX `use_count_idx` ON `hashtags` (`useCount`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `post_hashtags` (`postId`);--> statement-breakpoint
CREATE INDEX `hashtag_idx` ON `post_hashtags` (`hashtagId`);