import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Assessment,
  ChatMessage,
  Conversation,
  EntityAccess,
  InsertAssessment,
  InsertChatMessage,
  InsertConversation,
  InsertEntityAccess,
  InsertMemory,
  InsertMindEntity,
  InsertMindProfile,
  InsertUser,
  Memory,
  MindEntity,
  MindProfile,
  assessments,
  chatMessages,
  conversations,
  entityAccess,
  memories,
  mindEntities,
  mindProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Mind Profiles ───────────────────────────────────────
export async function getMindProfile(userId: number): Promise<MindProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mindProfiles).where(eq(mindProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMindProfile(userId: number, data: Partial<InsertMindProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMindProfile(userId);
  if (existing) {
    await db.update(mindProfiles).set(data).where(eq(mindProfiles.userId, userId));
    return { ...existing, ...data };
  } else {
    await db.insert(mindProfiles).values({ userId, ...data });
    return await getMindProfile(userId);
  }
}

// ─── Memories ────────────────────────────────────────────
export async function getMemories(userId: number): Promise<Memory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memories).where(eq(memories.userId, userId)).orderBy(desc(memories.createdAt));
}

export async function addMemory(data: InsertMemory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memories).values(data);
  return result;
}

export async function deleteMemory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memories).where(and(eq(memories.id, id), eq(memories.userId, userId)));
}

// ─── Assessments ─────────────────────────────────────────
export async function getAssessments(userId: number): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.userId, userId)).orderBy(desc(assessments.completedAt));
}

export async function getAssessmentByType(userId: number, type: string): Promise<Assessment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.userId, userId), eq(assessments.assessmentType, type as any)))
    .orderBy(desc(assessments.completedAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveAssessment(data: InsertAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(assessments).values(data);
}

// ─── Mind Entities ───────────────────────────────────────
export async function getMindEntity(userId: number): Promise<MindEntity | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mindEntities).where(eq(mindEntities.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMindEntityById(id: number): Promise<MindEntity | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mindEntities).where(eq(mindEntities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMindEntity(userId: number, data: Partial<InsertMindEntity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMindEntity(userId);
  if (existing) {
    await db.update(mindEntities).set(data).where(eq(mindEntities.userId, userId));
    return { ...existing, ...data };
  } else {
    await db.insert(mindEntities).values({ userId, ...data });
    return await getMindEntity(userId);
  }
}

export async function getCollectiveMinds(): Promise<MindEntity[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mindEntities)
    .where(and(eq(mindEntities.inCollective, true), eq(mindEntities.status, "active")))
    .orderBy(desc(mindEntities.createdAt));
}

export async function getPublicMinds(): Promise<MindEntity[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mindEntities)
    .where(and(eq(mindEntities.isPublic, true), eq(mindEntities.status, "active")))
    .orderBy(desc(mindEntities.createdAt));
}

// ─── Conversations ───────────────────────────────────────
export async function createConversation(data: InsertConversation): Promise<Conversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values(data);
  const id = (result[0] as any).insertId;
  const conv = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return conv[0];
}

export async function getConversation(id: number): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Chat Messages ───────────────────────────────────────
export async function getChatMessages(conversationId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values(data);
}

// ─── Profile Completeness Calculator ─────────────────────
export function calculateCompleteness(
  profile: MindProfile | undefined,
  memoryCount: number,
  assessmentTypes: string[]
): number {
  if (!profile) return 0;
  let score = 0;
  const profileFields = [
    "displayName",
    "birthYear",
    "location",
    "occupation",
    "lifeStory",
    "coreValues",
    "beliefs",
    "likesAndJoys",
    "dislikesAndFears",
    "communicationStyle",
    "importantPeople",
  ] as const;
  const filledFields = profileFields.filter(
    (f) => profile[f] != null && String(profile[f]).trim() !== ""
  );
  score += Math.round((filledFields.length / profileFields.length) * 50);
  // Memories (20 points)
  score += Math.min(20, memoryCount * 4);
  // Assessments (30 points - 10 each)
  if (assessmentTypes.includes("big_five")) score += 10;
  if (assessmentTypes.includes("cognitive")) score += 10;
  if (assessmentTypes.includes("competency")) score += 10;
  return Math.min(100, score);
}
