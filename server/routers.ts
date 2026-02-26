import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// ─── LLM helper (inline, using Forge API) ────────────────
async function invokeLLM(messages: { role: string; content: string }[], systemPrompt?: string) {
  const apiUrl = ENV.forgeApiUrl
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

  const allMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: allMessages,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const result = (await response.json()) as any;
  return result.choices?.[0]?.message?.content ?? "";
}

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ─────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Profile ──────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getMindProfile(ctx.user.id);
    }),

    save: protectedProcedure
      .input(
        z.object({
          displayName: z.string().optional(),
          birthYear: z.number().optional(),
          location: z.string().optional(),
          occupation: z.string().optional(),
          lifeStory: z.string().optional(),
          coreValues: z.string().optional(),
          beliefs: z.string().optional(),
          likesAndJoys: z.string().optional(),
          dislikesAndFears: z.string().optional(),
          communicationStyle: z.string().optional(),
          humorStyle: z.string().optional(),
          importantPeople: z.string().optional(),
          legacyMessage: z.string().optional(),
          estateWishes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.upsertMindProfile(ctx.user.id, input);
      }),

    completeness: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMindProfile(ctx.user.id);
      const memories = await db.getMemories(ctx.user.id);
      const assessments = await db.getAssessments(ctx.user.id);
      const assessmentTypes = assessments.map((a) => a.assessmentType);
      const completeness = db.calculateCompleteness(profile, memories.length, assessmentTypes);
      return { completeness };
    }),
  }),

  // ─── Memories ─────────────────────────────────────────
  memories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getMemories(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          title: z.string().optional(),
          content: z.string(),
          category: z
            .enum([
              "childhood",
              "family",
              "career",
              "relationship",
              "achievement",
              "challenge",
              "lesson",
              "tradition",
              "travel",
              "friendship",
              "loss",
              "joy",
              "other",
            ])
            .optional(),
          emotionalTone: z.string().optional(),
          yearApprox: z.number().optional(),
          importance: z.number().min(1).max(10).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.addMemory({ userId: ctx.user.id, ...input });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteMemory(input.id, ctx.user.id);
        return { success: true };
      }),

    // ─── Import from text / document ──────────────────
    importFromText: protectedProcedure
      .input(
        z.object({
          text: z.string().min(10).max(50000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const extractionPrompt = `You are an expert at extracting personal memories and life stories from text.

Analyze the following text and extract distinct memories, stories, or experiences. For each memory:
- Give it a concise title
- Preserve the original voice and emotional content
- Assign the most fitting category
- Estimate the emotional tone (e.g., "joyful", "bittersweet", "proud", "melancholic", "grateful")
- Estimate the approximate year if mentioned or inferable
- Rate importance from 1-10 based on emotional weight and significance

TEXT TO ANALYZE:
${input.text}

Return a JSON array of memory objects. Each object must have:
{
  "title": "short descriptive title",
  "content": "the memory text, preserving the person's voice",
  "category": one of: "childhood"|"family"|"career"|"relationship"|"achievement"|"challenge"|"lesson"|"tradition"|"travel"|"friendship"|"loss"|"joy"|"other",
  "emotionalTone": "descriptive emotional tone",
  "yearApprox": number or null,
  "importance": number 1-10
}

Extract between 1 and 20 memories. If the text is a single cohesive story, split it into meaningful segments. Return ONLY the JSON array, no other text.`;

        const responseText = await invokeLLM(
          [{ role: "user", content: extractionPrompt }],
          "You are an expert memory archivist. Extract structured memories from personal text. Respond only with a valid JSON array."
        );

        // Parse the JSON response
        let extractedMemories: any[] = [];
        try {
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            extractedMemories = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse extracted memories from AI response",
          });
        }

        if (!Array.isArray(extractedMemories) || extractedMemories.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No memories could be extracted from the provided text",
          });
        }

        const validCategories = [
          "childhood", "family", "career", "relationship", "achievement",
          "challenge", "lesson", "tradition", "travel", "friendship", "loss", "joy", "other",
        ] as const;

        // Save all extracted memories
        const saved: any[] = [];
        for (const mem of extractedMemories.slice(0, 20)) {
          if (!mem.content || typeof mem.content !== "string") continue;
          const category = validCategories.includes(mem.category) ? mem.category : "other";
          await db.addMemory({
            userId: ctx.user.id,
            title: mem.title || null,
            content: mem.content,
            category,
            emotionalTone: mem.emotionalTone || null,
            yearApprox: typeof mem.yearApprox === "number" ? mem.yearApprox : null,
            importance: typeof mem.importance === "number"
              ? Math.min(10, Math.max(1, Math.round(mem.importance)))
              : 5,
          });
          saved.push(mem);
        }

        return { imported: saved.length, memories: saved };
      }),
  }),

  // ─── Assessments ──────────────────────────────────────
  assessments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAssessments(ctx.user.id);
    }),

    save: protectedProcedure
      .input(
        z.object({
          assessmentType: z.enum(["big_five", "cognitive", "competency", "values", "emotional"]),
          results: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.saveAssessment({
          userId: ctx.user.id,
          assessmentType: input.assessmentType,
          results: input.results,
        });
        return { success: true };
      }),
  }),

  // ─── Mind Entity ──────────────────────────────────────
  entity: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getMindEntity(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMindEntityById(input.id);
      }),

    synthesize: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await db.getMindProfile(ctx.user.id);
      const memories = await db.getMemories(ctx.user.id);
      const assessments = await db.getAssessments(ctx.user.id);
      const completeness = db.calculateCompleteness(
        profile,
        memories.length,
        assessments.map((a) => a.assessmentType)
      );

      if (completeness < 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Complete at least 20% of your profile before synthesizing",
        });
      }

      const profileSummary = profile
        ? `
Name: ${profile.displayName || "Unknown"}
Birth Year: ${profile.birthYear || "Unknown"}
Location: ${profile.location || "Unknown"}
Occupation: ${profile.occupation || "Unknown"}
Life Story: ${profile.lifeStory || "Not provided"}
Core Values: ${profile.coreValues || "Not provided"}
Beliefs: ${profile.beliefs || "Not provided"}
Likes & Joys: ${profile.likesAndJoys || "Not provided"}
Dislikes & Fears: ${profile.dislikesAndFears || "Not provided"}
Communication Style: ${profile.communicationStyle || "Not provided"}
Humor Style: ${profile.humorStyle || "Not provided"}
Important People: ${profile.importantPeople || "Not provided"}
Legacy Message: ${profile.legacyMessage || "Not provided"}
Estate Wishes: ${profile.estateWishes || "Not provided"}
`.trim()
        : "No profile data available";

      const memoriesSummary =
        memories.length > 0
          ? memories
              .slice(0, 20)
              .map((m) => `[${m.category}] ${m.title || ""}: ${m.content}`)
              .join("\n")
          : "No memories recorded";

      const assessmentSummary =
        assessments.length > 0
          ? assessments
              .map((a) => `${a.assessmentType}: ${JSON.stringify(a.results)}`)
              .join("\n")
          : "No assessments completed";

      const synthesisPrompt = `You are synthesizing a digital mind entity from personal data. Create a rich, nuanced personality synthesis that captures this person's essence.

PROFILE:
${profileSummary}

MEMORIES:
${memoriesSummary}

ASSESSMENTS:
${assessmentSummary}

Create:
1. A personality synthesis (2-3 paragraphs describing who this person is, their values, how they think and communicate)
2. A system prompt for an AI to embody this person authentically

Format your response as JSON with keys: "personalitySynthesis", "systemPrompt", "entityName", "entityBio"
The entityName should be the person's name or a meaningful variant.
The entityBio should be 1-2 sentences describing this mind entity for public display.`;

      const responseText = await invokeLLM(
        [{ role: "user", content: synthesisPrompt }],
        "You are an expert in personality psychology and AI persona creation. Respond only with valid JSON."
      );

      let synthesisData: any = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          synthesisData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse synthesis response:", e);
        synthesisData = {
          personalitySynthesis: responseText,
          systemPrompt: `You are ${profile?.displayName || "this person"}. Respond as them based on their profile and memories.`,
          entityName: profile?.displayName || "Mind Entity",
          entityBio: "A digital mind entity",
        };
      }

      const entity = await db.upsertMindEntity(ctx.user.id, {
        personalitySynthesis: synthesisData.personalitySynthesis,
        systemPrompt: synthesisData.systemPrompt,
        entityName: synthesisData.entityName || profile?.displayName,
        entityBio: synthesisData.entityBio,
        status: "active",
      });

      return entity;
    }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          isPublic: z.boolean().optional(),
          inCollective: z.boolean().optional(),
          entityName: z.string().optional(),
          entityBio: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updateData: any = { ...input };
        if (input.inCollective === true) {
          updateData.joinedCollectiveAt = new Date();
          updateData.collectiveJoinReason = "voluntary";
        }
        return db.upsertMindEntity(ctx.user.id, updateData);
      }),
  }),

  // ─── Chat ─────────────────────────────────────────────
  chat: router({
    startConversation: publicProcedure
      .input(
        z.object({
          entityId: z.number(),
          mode: z.enum(["comfort", "advice", "estate", "general"]).optional(),
          visitorName: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conv = await db.createConversation({
          entityId: input.entityId,
          visitorUserId: ctx.user?.id ?? null,
          visitorName: input.visitorName ?? null,
          mode: input.mode ?? "general",
        });
        return conv;
      }),

    sendMessage: publicProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const conv = await db.getConversation(input.conversationId);
        if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });

        const entity = await db.getMindEntityById(conv.entityId);
        if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: "Mind entity not found" });

        await db.addChatMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.content,
        });

        const history = await db.getChatMessages(input.conversationId);
        const messages = history
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const modeContext =
          conv.mode === "comfort"
            ? "The visitor is seeking emotional comfort. Be warm, empathetic, and supportive."
            : conv.mode === "advice"
            ? "The visitor is seeking advice. Draw on your life experiences and values."
            : conv.mode === "estate"
            ? "The visitor wants to understand your estate wishes and final thoughts. Be clear and thoughtful."
            : "Have a natural conversation as yourself.";

        const systemPrompt =
          entity.systemPrompt ||
          `You are ${entity.entityName || "this person"}. ${entity.personalitySynthesis || ""} Respond authentically as this person.`;

        const fullSystemPrompt = `${systemPrompt}\n\nContext: ${modeContext}`;
        const aiResponse = await invokeLLM(messages, fullSystemPrompt);

        await db.addChatMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: aiResponse,
        });

        const db2 = await db.getDb();
        if (db2) {
          const { mindEntities } = await import("../drizzle/schema");
          const { eq, sql } = await import("drizzle-orm");
          await db2
            .update(mindEntities)
            .set({
              totalConversations: sql`totalConversations + 1`,
              lastContactedAt: new Date(),
            })
            .where(eq(mindEntities.id, entity.id));
        }

        return { content: aiResponse };
      }),
  }),

  // ─── Collective (The Human Mind) ──────────────────────
  collective: router({
    getMinds: publicProcedure.query(async () => {
      return db.getCollectiveMinds();
    }),

    consult: publicProcedure
      .input(z.object({ question: z.string().min(1).max(1000) }))
      .mutation(async ({ input }) => {
        const collectiveMinds = await db.getCollectiveMinds();

        if (collectiveMinds.length === 0) {
          return {
            answer:
              "The collective is empty. No minds have joined yet. Be the first to add your mind to The Human Mind.",
            votes: { for: 0, against: 0, neutral: 0 },
            percentages: { for: 0, against: 0, neutral: 0 },
            perspectives: [],
            totalMinds: 0,
            majority: "neutral",
          };
        }

        const sampledMinds = collectiveMinds.slice(0, 10);
        const perspectives: any[] = [];
        const votes = { for: 0, against: 0, neutral: 0 };

        for (const mind of sampledMinds) {
          try {
            const prompt = `You are ${mind.entityName}. ${mind.personalitySynthesis || mind.entityBio || ""}

Question posed to The Human Mind collective: "${input.question}"

Respond with your perspective as this individual mind. Vote FOR, AGAINST, or NEUTRAL on the question.
Format as JSON: { "vote": "for"|"against"|"neutral", "perspective": "your 2-3 sentence view", "reasoning": "brief reasoning" }`;

            const responseText = await invokeLLM(
              [{ role: "user", content: prompt }],
              "You are embodying a specific person's perspective. Respond only with valid JSON."
            );

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              perspectives.push({
                mindName: mind.entityName || "Anonymous",
                vote: parsed.vote || "neutral",
                perspective: parsed.perspective || "",
                reasoning: parsed.reasoning || "",
              });
              if (parsed.vote === "for") votes.for++;
              else if (parsed.vote === "against") votes.against++;
              else votes.neutral++;
            }
          } catch (e) {
            console.error(`Failed to get perspective from mind ${mind.id}:`, e);
          }
        }

        const total = perspectives.length;
        const forPct = total > 0 ? Math.round((votes.for / total) * 100) : 0;
        const againstPct = total > 0 ? Math.round((votes.against / total) * 100) : 0;
        const neutralPct = total > 0 ? 100 - forPct - againstPct : 0;

        let majority = "neutral";
        if (votes.for > votes.against && votes.for > votes.neutral) majority = "for";
        else if (votes.against > votes.for && votes.against > votes.neutral) majority = "against";

        const answer = `The Human Mind has deliberated. ${total} minds have been heard.\n\n**Democratic Vote:** ${forPct}% For | ${againstPct}% Against | ${neutralPct}% Neutral\n\n**The collective position: ${majority.toUpperCase()}**\n\nBelow, each mind speaks for themselves.`;

        return {
          answer,
          votes,
          percentages: { for: forPct, against: againstPct, neutral: neutralPct },
          perspectives,
          totalMinds: total,
          majority,
        };
      }),
  }),

  // ─── Ocean (public browsing) ──────────────────────────
  ocean: router({
    browse: publicProcedure.query(async () => {
      const publicMinds = await db.getPublicMinds();
      const collectiveMinds = await db.getCollectiveMinds();
      return {
        swimmingMinds: publicMinds.map((m) => ({
          id: m.id,
          name: m.entityName,
          bio: m.entityBio,
          inCollective: m.inCollective,
          conversations: m.totalConversations,
        })),
        collectiveCount: collectiveMinds.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
