CREATE TABLE `diary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character_id` integer NOT NULL,
	`content` text NOT NULL,
	`sentiment` text DEFAULT 'neutral' NOT NULL,
	`create_date` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `chats` ADD `summary` text DEFAULT '' NOT NULL;