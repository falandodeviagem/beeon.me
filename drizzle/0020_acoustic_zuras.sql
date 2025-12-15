CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`interval` enum('monthly','yearly','lifetime') NOT NULL,
	`price` int NOT NULL,
	`originalPrice` int,
	`features` text,
	`stripePriceId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`isDefault` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payments` ADD `planId` int;--> statement-breakpoint
ALTER TABLE `payments` ADD `planInterval` varchar(20);--> statement-breakpoint
CREATE INDEX `plan_community_idx` ON `subscription_plans` (`communityId`);--> statement-breakpoint
CREATE INDEX `plan_active_idx` ON `subscription_plans` (`isActive`);