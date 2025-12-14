CREATE TABLE `user_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `follower_following_idx` UNIQUE(`followerId`,`followingId`)
);
--> statement-breakpoint
CREATE INDEX `follower_idx` ON `user_follows` (`followerId`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `user_follows` (`followingId`);