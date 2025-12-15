CREATE TABLE `moderation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moderatorId` int NOT NULL,
	`action` enum('remove_post','remove_comment','ban_user','unban_user','resolve_report') NOT NULL,
	`targetUserId` int,
	`postId` int,
	`commentId` int,
	`reportId` int,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `moderator_idx` ON `moderation_logs` (`moderatorId`);--> statement-breakpoint
CREATE INDEX `target_user_idx` ON `moderation_logs` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `moderation_logs` (`action`);