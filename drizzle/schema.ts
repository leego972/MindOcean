import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Personal profile data used to build the mind entity */
export const mindProfiles = mysqlTable("mind_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 200 }),
  birthYear: int("birthYear"),
  location: varchar("location", { length: 200 }),
  occupation: varchar("occupation", { length: 200 }),
  // Life narrative
  lifeStory: text("lifeStory"),
  coreValues: text("coreValues"),
  beliefs: text("beliefs"),
  // Personality traits
  likesAndJoys: text("likesAndJoys"),
  dislikesAndFears: text("dislikesAndFears"),
  communicationStyle: text("communicationStyle"),
  humorStyle: text("humorStyle"),
  // Relationships
  importantPeople: text("importantPeople"),
  // Legacy wishes
  legacyMessage: text("legacyMessage"),
  estateWishes: text("estateWishes"),
  // Profile completeness (0-100)
  completeness: int("completeness").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MindProfile = typeof mindProfiles.$inferSelect;
export type InsertMindProfile = typeof mindProfiles.$inferInsert;

/** Individual memories - specific stories, events, experiences */
export const memories = mysqlTable("memories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }),
  content: text("content").notNull(),
  category: mysqlEnum("category", [
    "childhood", "family", "career", "relationship",
    "achievement", "challenge", "lesson", "tradition",
    "travel", "friendship", "loss", "joy", "other"
  ]).default("other"),
  emotionalTone: varchar("emotionalTone", { length: 100 }),
  yearApprox: int("yearApprox"),
  importance: int("importance").default(5), // 1-10
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Memory = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;

/** Assessment results - Big Five, cognitive, competency */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assessmentType: mysqlEnum("assessmentType", [
    "big_five", "cognitive", "competency", "values", "emotional"
  ]).notNull(),
  results: json("results"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/** The synthesized mind entity */
export const mindEntities = mysqlTable("mind_entities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  personalitySynthesis: text("personalitySynthesis"),
  systemPrompt: text("systemPrompt"),
  status: mysqlEnum("status", ["building", "active", "archived"]).default("building"),
  isPublic: boolean("isPublic").default(false),
  inCollective: boolean("inCollective").default(false),
  entityName: varchar("entityName", { length: 200 }),
  entityBio: text("entityBio"),
  /** URL-friendly slug for shareable links, e.g. /mind/john-doe-a1b2 */
  slug: varchar("slug", { length: 120 }).unique(),
  /** Opaque token for private share links */
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  totalConversations: int("totalConversations").default(0),
  lastContactedAt: timestamp("lastContactedAt"),
  joinedCollectiveAt: timestamp("joinedCollectiveAt"),
  collectiveJoinReason: mysqlEnum("collectiveJoinReason", ["voluntary", "auto_inactive", "all_relations_passed"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MindEntity = typeof mindEntities.$inferSelect;
export type InsertMindEntity = typeof mindEntities.$inferInsert;

/** Chat conversations with mind entities */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  entityId: int("entityId").notNull(),
  visitorUserId: int("visitorUserId"),
  visitorName: varchar("visitorName", { length: 200 }),
  mode: mysqlEnum("mode", ["comfort", "advice", "estate", "general"]).default("general"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/** Individual chat messages */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/** Access permissions - who can talk to which mind entity */
export const entityAccess = mysqlTable("entity_access", {
  id: int("id").autoincrement().primaryKey(),
  entityId: int("entityId").notNull(),
  grantedToUserId: int("grantedToUserId"),
  grantedToEmail: varchar("grantedToEmail", { length: 320 }),
  accessLevel: mysqlEnum("accessLevel", ["chat", "estate", "full"]).default("chat"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EntityAccess = typeof entityAccess.$inferSelect;
export type InsertEntityAccess = typeof entityAccess.$inferInsert;
