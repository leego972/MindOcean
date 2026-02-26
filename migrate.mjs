/**
 * migrate.mjs — run Drizzle migrations programmatically.
 * Called by Railway's build phase via nixpacks.toml after `pnpm build`.
 * Uses the pre-generated SQL files in ./drizzle/ — no drizzle-kit required at runtime.
 */
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[migrate] DATABASE_URL is not set — skipping migrations.");
  process.exit(0);
}

let connection;
try {
  connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("[migrate] Running Drizzle migrations...");
  await migrate(db, { migrationsFolder: path.join(__dirname, "drizzle") });
  console.log("[migrate] All migrations applied successfully.");
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exit(1);
} finally {
  if (connection) await connection.end();
}
