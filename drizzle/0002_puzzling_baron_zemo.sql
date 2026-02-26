ALTER TABLE `mind_entities` ADD `slug` varchar(120);--> statement-breakpoint
ALTER TABLE `mind_entities` ADD `shareToken` varchar(64);--> statement-breakpoint
ALTER TABLE `mind_entities` ADD CONSTRAINT `mind_entities_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `mind_entities` ADD CONSTRAINT `mind_entities_shareToken_unique` UNIQUE(`shareToken`);