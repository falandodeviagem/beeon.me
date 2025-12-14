CREATE TABLE `community_promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`promotedCommunityId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_promoted_idx` UNIQUE(`communityId`,`promotedCommunityId`)
);
--> statement-breakpoint
CREATE INDEX `community_idx` ON `community_promotions` (`communityId`);