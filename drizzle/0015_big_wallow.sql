CREATE TABLE `user_warnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`moderatorId` int NOT NULL,
	`level` enum('warning_1','warning_2','temp_ban','perm_ban') NOT NULL,
	`reason` text NOT NULL,
	`reportId` int,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_warnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `warning_user_idx` ON `user_warnings` (`userId`);--> statement-breakpoint
CREATE INDEX `warning_moderator_idx` ON `user_warnings` (`moderatorId`);--> statement-breakpoint
CREATE INDEX `warning_level_idx` ON `user_warnings` (`level`);--> statement-breakpoint
CREATE INDEX `warning_active_idx` ON `user_warnings` (`isActive`);