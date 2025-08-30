ALTER TABLE `Account` ADD `refreshToken` text;--> statement-breakpoint
ALTER TABLE `Account` ADD `accessToken` text;--> statement-breakpoint
ALTER TABLE `Account` ADD `expires_at` numeric;--> statement-breakpoint
ALTER TABLE `Account` ADD `token_type` text;--> statement-breakpoint
ALTER TABLE `Account` ADD `scope` text;--> statement-breakpoint
ALTER TABLE `Account` ADD `id_token` text;--> statement-breakpoint
ALTER TABLE `Account` ADD `session_state` text;