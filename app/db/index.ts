import { sql as vercelSql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { oracleUpdates, oracleLatest } from "./schema";
import { eq, desc, sql } from "drizzle-orm";
import type { OracleData } from "../lib/oracles";

export const db = drizzle(vercelSql);

let tablesCreated = false;

async function ensureTables() {
  if (tablesCreated) return;

  try {
    await vercelSql`
      CREATE TABLE IF NOT EXISTS oracle_updates (
        id SERIAL PRIMARY KEY,
        oracle_name TEXT NOT NULL,
        price REAL NOT NULL,
        updated_at INTEGER NOT NULL,
        recorded_at INTEGER NOT NULL,
        decimals INTEGER NOT NULL,
        raw_price TEXT NOT NULL
      )
    `;

    await vercelSql`
      CREATE TABLE IF NOT EXISTS oracle_latest (
        oracle_name TEXT PRIMARY KEY,
        price REAL NOT NULL,
        updated_at INTEGER NOT NULL,
        recorded_at INTEGER NOT NULL,
        decimals INTEGER NOT NULL,
        raw_price TEXT NOT NULL,
        last_change_at INTEGER,
        update_count INTEGER DEFAULT 0
      )
    `;

    await vercelSql`
      CREATE INDEX IF NOT EXISTS idx_updates_oracle_time
        ON oracle_updates(oracle_name, recorded_at DESC)
    `;

    tablesCreated = true;
  } catch (error) {
    // Tables might already exist, that's ok
    console.log("Tables setup:", error);
    tablesCreated = true;
  }
}

export async function recordOracleData(data: OracleData) {
  await ensureTables();

  const now = Math.floor(Date.now() / 1000);

  // Get existing latest record
  const existingResult = await db
    .select()
    .from(oracleLatest)
    .where(eq(oracleLatest.oracleName, data.name))
    .limit(1);

  const existing = existingResult[0];

  // Check if this is a new price update (timestamp changed)
  const isNewUpdate = !existing || existing.updatedAt !== data.updatedAt;

  if (isNewUpdate) {
    // Record in history
    await db.insert(oracleUpdates)
      .values({
        oracleName: data.name,
        price: data.price,
        updatedAt: data.updatedAt,
        recordedAt: now,
        decimals: data.decimals,
        rawPrice: data.rawPrice,
      });

    // Update or insert latest
    await db.insert(oracleLatest)
      .values({
        oracleName: data.name,
        price: data.price,
        updatedAt: data.updatedAt,
        recordedAt: now,
        decimals: data.decimals,
        rawPrice: data.rawPrice,
        lastChangeAt: now,
        updateCount: 1,
      })
      .onConflictDoUpdate({
        target: oracleLatest.oracleName,
        set: {
          price: data.price,
          updatedAt: data.updatedAt,
          recordedAt: now,
          decimals: data.decimals,
          rawPrice: data.rawPrice,
          lastChangeAt: now,
          updateCount: sql`${oracleLatest.updateCount} + 1`,
        },
      });
  }

  return isNewUpdate;
}

export async function getLatestOracles() {
  await ensureTables();

  return db
    .select()
    .from(oracleLatest)
    .orderBy(desc(oracleLatest.updatedAt));
}

export async function getOracleHistory(oracleName: string, limit = 100) {
  await ensureTables();

  return db
    .select()
    .from(oracleUpdates)
    .where(eq(oracleUpdates.oracleName, oracleName))
    .orderBy(desc(oracleUpdates.recordedAt))
    .limit(limit);
}

export async function getRecentUpdates(limit = 50) {
  await ensureTables();

  return db
    .select()
    .from(oracleUpdates)
    .orderBy(desc(oracleUpdates.recordedAt))
    .limit(limit);
}
