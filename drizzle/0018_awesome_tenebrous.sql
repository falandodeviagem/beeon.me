CREATE TABLE `user_hashtag_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`hashtagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_hashtag_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_hashtag_follow` UNIQUE(`userId`,`hashtagId`)
);
--> statement-breakpoint
CREATE INDEX `hashtag_follow_user_idx` ON `user_hashtag_follows` (`userId`);--> statement-breakpoint
CREATE INDEX `hashtag_follow_hashtag_idx` ON `user_hashtag_follows` (`hashtagId`);