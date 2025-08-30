CREATE TABLE `google_oauth_credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text DEFAULT 'google' NOT NULL,
	`access_token` text,
	`refresh_token` text NOT NULL,
	`token_type` text DEFAULT 'Bearer',
	`scope` text,
	`expires_at` numeric,
	`client_id` text,
	`last_refresh_at` numeric,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `refreshToken`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `accessToken`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `expires_at`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `token_type`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `scope`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `id_token`;--> statement-breakpoint
ALTER TABLE `Account` DROP COLUMN `session_state`;