CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`userId` int NOT NULL,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ban_appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminId` int,
	`adminResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `ban_appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_entity_type_idx` ON `audit_logs` (`entityType`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `appeal_user_idx` ON `ban_appeals` (`userId`);--> statement-breakpoint
CREATE INDEX `appeal_status_idx` ON `ban_appeals` (`status`);