CREATE TABLE `post_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`reactionType` enum('love','like','laugh','wow','sad','angry') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_user_idx` UNIQUE(`postId`,`userId`)
);
--> statement-breakpoint
CREATE INDEX `post_idx` ON `post_reactions` (`postId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `post_reactions` (`userId`);