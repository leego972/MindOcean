CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assessmentType` enum('big_five','cognitive','competency','values','emotional') NOT NULL,
	`results` json,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityId` int NOT NULL,
	`visitorUserId` int,
	`visitorName` varchar(200),
	`mode` enum('comfort','advice','estate','general') DEFAULT 'general',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityId` int NOT NULL,
	`grantedToUserId` int,
	`grantedToEmail` varchar(320),
	`accessLevel` enum('chat','estate','full') DEFAULT 'chat',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `entity_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300),
	`content` text NOT NULL,
	`category` enum('childhood','family','career','relationship','achievement','challenge','lesson','tradition','travel','friendship','loss','joy','other') DEFAULT 'other',
	`emotionalTone` varchar(100),
	`yearApprox` int,
	`importance` int DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mind_entities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`personalitySynthesis` text,
	`systemPrompt` text,
	`status` enum('building','active','archived') DEFAULT 'building',
	`isPublic` boolean DEFAULT false,
	`inCollective` boolean DEFAULT false,
	`entityName` varchar(200),
	`entityBio` text,
	`totalConversations` int DEFAULT 0,
	`lastContactedAt` timestamp,
	`joinedCollectiveAt` timestamp,
	`collectiveJoinReason` enum('voluntary','auto_inactive','all_relations_passed'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mind_entities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mind_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(200),
	`birthYear` int,
	`location` varchar(200),
	`occupation` varchar(200),
	`lifeStory` text,
	`coreValues` text,
	`beliefs` text,
	`likesAndJoys` text,
	`dislikesAndFears` text,
	`communicationStyle` text,
	`humorStyle` text,
	`importantPeople` text,
	`legacyMessage` text,
	`estateWishes` text,
	`completeness` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mind_profiles_id` PRIMARY KEY(`id`)
);
