CREATE TABLE `response_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('appeal_approve','appeal_reject','report_resolve','report_dismiss','warning','ban') NOT NULL,
	`createdBy` int NOT NULL,
	`useCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `response_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `template_category_idx` ON `response_templates` (`category`);--> statement-breakpoint
CREATE INDEX `template_created_by_idx` ON `response_templates` (`createdBy`);