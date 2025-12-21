CREATE TABLE `community_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`date` date NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`uniqueVisitors` int NOT NULL DEFAULT 0,
	`newPosts` int NOT NULL DEFAULT 0,
	`newComments` int NOT NULL DEFAULT 0,
	`totalLikes` int NOT NULL DEFAULT 0,
	`totalShares` int NOT NULL DEFAULT 0,
	`newMembers` int NOT NULL DEFAULT 0,
	`activeMembers` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pushEnabled` boolean NOT NULL DEFAULT true,
	`pushComments` boolean NOT NULL DEFAULT true,
	`pushLikes` boolean NOT NULL DEFAULT true,
	`pushFollows` boolean NOT NULL DEFAULT true,
	`pushMessages` boolean NOT NULL DEFAULT true,
	`pushBadges` boolean NOT NULL DEFAULT true,
	`pushCommunity` boolean NOT NULL DEFAULT true,
	`inAppEnabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `post_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`uniqueViews` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`avgTimeSpent` int NOT NULL DEFAULT 0,
	`reach` int NOT NULL DEFAULT 0,
	`impressions` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_analytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_analytics_postId_unique` UNIQUE(`postId`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsed` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `analytics_community_date_idx` ON `community_analytics` (`communityId`,`date`);--> statement-breakpoint
CREATE INDEX `notif_pref_user_idx` ON `notification_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `post_analytics_post_idx` ON `post_analytics` (`postId`);--> statement-breakpoint
CREATE INDEX `push_user_idx` ON `push_subscriptions` (`userId`);