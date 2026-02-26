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
