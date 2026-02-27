# MindOcean TODO

## Core Setup
- [x] Initialize project scaffold (web-db-user)
- [x] Integrate database schema (users, mind_profiles, memories, assessments, mind_entities, conversations, chat_messages, entity_access)
- [x] Integrate server/db.ts with all query helpers
- [x] Integrate server/routers.ts with all tRPC procedures
- [x] Integrate all frontend pages (Home, Dashboard, ProfileSetup, Memories, Assessments, BigFiveTest, CognitiveTest, CompetencyTest, MindEntity, ChatWithMind, TheHumanMind, Ocean)
- [x] Integrate AIChatBox component
- [x] Integrate DashboardLayout component
- [x] Integrate index.css with ocean theme
- [x] Integrate index.html with MindOcean metadata
- [x] Integrate App.tsx with all routes
- [x] Integrate shared constants (const.ts)
- [x] Integrate LLM helper (llm.ts)
- [x] Integrate OAuth routes (oauth.ts)
- [x] Integrate env.ts
- [x] Push database migrations

## Railway Deployment
- [x] Add railway.json / nixpacks config
- [x] Ensure build and start scripts are correct
- [x] Add .env.example for Railway environment variables

## GitHub
- [x] Create GitHub repository "MindOcean"
- [x] Push all code to GitHub

## Tests
- [x] Vitest tests for calculateCompleteness (from original project)
- [x] Vitest tests for auth.me and auth.logout

## New Features (Round 2)
- [x] Add /api/health endpoint for Railway health checks
- [x] Add memory import from text/document (AI auto-extracts and categorises memories)
- [x] Add ImportMemories page/modal with text paste + file upload (.txt, .md, .pdf)
- [x] Add server tRPC procedure: memories.importFromText
- [x] Update Memories page with "Import" button

## New Features (Round 3)
- [x] Memory search bar (client-side filter by title/content)
- [x] Memory category filter chips
- [x] Weekly memory prompt notification (server-side tRPC mutation)
- [x] Add slug field to mind_entities table for shareable URLs
- [x] Add entity.getBySlug tRPC procedure
- [x] Public /mind/:slug page showing entity profile + chat
- [x] Share button on MindEntity page (copy link to clipboard)
- [x] Update App.tsx with /mind/:slug route

## New Features (Round 3 - Full Enhancement)
- [x] Add slug + shareToken fields to mind_entities schema
- [x] Push DB migration
- [x] entity.getBySlug tRPC procedure (public)
- [x] entity.generateShareLink tRPC procedure
- [x] memories.search tRPC procedure (server-side search)
- [x] notifications.sendWeeklyMemoryPrompt tRPC mutation
- [x] Public /mind/:slug page (entity profile, bio, chat interface)
- [x] Share button on MindEntity page (copy link + private token link)
- [x] Memory search bar + category filter chips on Memories page
- [x] Weekly prompt button on MindEntity page
- [x] Dashboard: stats row (memories, assessments, conversations, share link)
- [x] Profile completeness tips (show what's missing)
- [x] profile.stats tRPC procedure
- [x] Auto-generate slug/shareToken on synthesis

## New Features (Round 4)
- [ ] Conversation history viewer page (/conversations)
- [ ] conversations.list tRPC procedure (paginated, with message count)
- [ ] conversations.getMessages tRPC procedure (full message thread)
- [ ] Add /conversations route to App.tsx
- [ ] Add Conversations link to nav
- [ ] QR code generator in share panel (qrcode.react)
- [ ] Custom domain setup guide page (/settings/domain or modal)
