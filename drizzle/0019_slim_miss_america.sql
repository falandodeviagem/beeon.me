CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`communityId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripeSessionId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripeInvoiceId` varchar(255),
	`stripeInvoiceUrl` text,
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `payment_user_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `payment_community_idx` ON `payments` (`communityId`);--> statement-breakpoint
CREATE INDEX `payment_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `payment_created_at_idx` ON `payments` (`createdAt`);