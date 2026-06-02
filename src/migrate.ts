import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";
const LEGACY_BASELINE_TAG = "0009_add_missing_tables";
const LATEST_TAG = "0011_course_price";

type JournalEntry = {
  idx: number;
  tag: string;
  when: number;
};

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

const loadMigrationEntries = (): JournalEntry[] => {
  const journalPath = path.resolve(__dirname, "drizzle/meta/_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf-8"));
  return (journal.entries || []) as JournalEntry[];
};

const ensureMigrationsTable = async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${MIGRATIONS_SCHEMA}"`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
};

const hasLegacySchema = async () => {
  const usersTable = await pool.query(
    `SELECT to_regclass('public.users') AS reg_class`,
  );
  const roleType = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') AS exists`,
  );

  return Boolean(usersTable.rows[0]?.reg_class) && Boolean(roleType.rows[0]?.exists);
};

const hasResetColumns = async () => {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'reset_password_token_hash'
      ) AS exists
    `,
  );

  return Boolean(result.rows[0]?.exists);
};

const baselineLegacyDatabaseIfNeeded = async () => {
  await ensureMigrationsTable();

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}"`,
  );

  if (Number(countResult.rows[0]?.count || 0) > 0) {
    return;
  }

  if (!(await hasLegacySchema())) {
    return;
  }

  const entries = loadMigrationEntries();
  const hasReset = await hasResetColumns();
  const targetTag = hasReset ? LATEST_TAG : LEGACY_BASELINE_TAG;
  const targetEntry = entries.find((entry) => entry.tag === targetTag);

  if (!targetEntry) {
    throw new Error(`Cannot baseline migrations: tag '${targetTag}' not found`);
  }

  const baselineEntries = entries.filter((entry) => entry.idx <= targetEntry.idx);

  for (const entry of baselineEntries) {
    await pool.query(
      `
        INSERT INTO "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" ("hash", "created_at")
        VALUES ($1, $2)
      `,
      [entry.tag, entry.when],
    );
  }

  console.log(
    `Detected legacy schema, baselined ${baselineEntries.length} migrations up to '${targetTag}'.`,
  );
};

async function main() {
  console.log("Running migrations...");
  await baselineLegacyDatabaseIfNeeded();
  await migrate(drizzle(pool), {
    migrationsFolder: "./dist/drizzle",
    migrationsSchema: MIGRATIONS_SCHEMA,
    migrationsTable: MIGRATIONS_TABLE,
  });
  console.log("Migrations complete");
  await pool.end();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
