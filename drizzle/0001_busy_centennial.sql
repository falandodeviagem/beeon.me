CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` text,
	`requiredPoints` int,
	`requiredLevel` int,
	`requiredAction` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `comment_user_idx` UNIQUE(`commentId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`postId` int NOT NULL,
	`authorId` int NOT NULL,
	`parentId` int,
	`likeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`isPaid` boolean NOT NULL DEFAULT false,
	`price` int NOT NULL DEFAULT 0,
	`stripeProductId` varchar(255),
	`stripePriceId` varchar(255),
	`ownerId` int NOT NULL,
	`memberCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`subscriptionStatus` enum('active','canceled','past_due','unpaid'),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_user_idx` UNIQUE(`communityId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `gamification_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gamification_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_user_idx` UNIQUE(`postId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`authorId` int NOT NULL,
	`communityId` int NOT NULL,
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('post','comment','user') NOT NULL,
	`targetId` int NOT NULL,
	`reporterId` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_badge_idx` UNIQUE(`userId`,`badgeId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `points` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `level` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `inviteCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `invitedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bannedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_inviteCode_unique` UNIQUE(`inviteCode`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `comment_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `comments` (`authorId`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `comments` (`parentId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `communities` (`ownerId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `community_members` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `gamification_actions` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `gamification_actions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `post_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `posts` (`authorId`);--> statement-breakpoint
CREATE INDEX `community_idx` ON `posts` (`communityId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `reporter_idx` ON `reports` (`reporterId`);--> statement-breakpoint
CREATE INDEX `target_idx` ON `reports` (`reportType`,`targetId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `invite_code_idx` ON `users` (`inviteCode`);