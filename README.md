# MindOcean

**MindOcean** is a digital mind preservation platform that allows you to create a virtual mind entity of yourself — preserving your personality, memories, and wisdom for your loved ones forever.

Built with React 19 + TypeScript + Tailwind CSS 4 on the frontend, and Express + tRPC + Drizzle ORM on the backend, with MySQL database support.

---

## Features

- **Mind Profile** — Record your life story, values, beliefs, communication style, and legacy wishes
- **Memories** — Add specific stories, events, and experiences categorized by type
- **Assessments** — Complete Big Five personality, cognitive, and competency assessments
- **Mind Entity** — AI synthesizes your data into a living digital mind entity
- **Chat with Mind** — Visitors can have conversations with your mind entity
- **The Human Mind** — A collective of minds that can deliberate on questions democratically
- **The Ocean** — Browse public mind entities swimming in the ocean

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Routing | Wouter |
| API | tRPC 11, Express 4 |
| Database | MySQL / TiDB via Drizzle ORM |
| Auth | OAuth (Manus) |
| AI | Gemini 2.5 Flash via Forge API |
| Build | Vite 7, esbuild |

---

## Railway Deployment

### Prerequisites

1. A [Railway](https://railway.app) account
2. A MySQL database (Railway MySQL plugin or PlanetScale/TiDB)
3. Manus OAuth credentials

### Steps

1. **Fork or clone** this repository to your GitHub account.

2. **Create a new Railway project** and connect your GitHub repository.

3. **Add a MySQL database** via Railway's plugin marketplace.

4. **Set the following environment variables** in Railway:

```
DATABASE_URL          = <auto-provided by Railway MySQL plugin>
JWT_SECRET            = <generate a strong random string>
NODE_ENV              = production
PORT                  = 3000

# Manus OAuth
VITE_APP_ID           = <your Manus app ID>
OAUTH_SERVER_URL      = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://manus.im
OWNER_OPEN_ID         = <your Manus OpenID>
OWNER_NAME            = <your name>

# AI (Forge API)
BUILT_IN_FORGE_API_URL  = https://forge.manus.im
BUILT_IN_FORGE_API_KEY  = <your Forge API key>
VITE_FRONTEND_FORGE_API_URL = https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY = <your frontend Forge API key>
```

5. **Deploy** — Railway will automatically build and deploy using the `nixpacks.toml` configuration.

6. **Run database migrations** — After first deploy, run:
   ```
   pnpm db:push
   ```

### Build Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm db:push` | Push database schema migrations |

---

## Local Development

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

---

## Project Structure

```
client/
  src/
    pages/          ← Page components (Home, Dashboard, etc.)
    components/     ← Reusable UI components
    contexts/       ← React contexts (Theme)
    lib/trpc.ts     ← tRPC client
    App.tsx         ← Routes
    index.css       ← Global styles (ocean theme)
drizzle/            ← Schema & migrations
server/
  db.ts             ← Database query helpers
  routers.ts        ← tRPC procedures
  _core/            ← Framework plumbing (OAuth, context, etc.)
shared/             ← Shared constants & types
```

---

## License

MIT
