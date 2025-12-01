import { NextResponse } from "next/server";
import { fetchAllOracles, type OracleData } from "@/app/lib/oracles";
import { recordOracleData, getLatestOracles } from "@/app/db";

export const dynamic = "force-dynamic";

// Check if database is available (Vercel Postgres env var)
const hasDatabase = !!process.env.POSTGRES_URL;

export async function GET() {
  try {
    const data = await fetchAllOracles();
    const oracles = Object.values(data) as OracleData[];

    // Get all oracles sorted by freshness (most recent updatedAt first)
    const sortedOracles = oracles.sort((a, b) => b.updatedAt - a.updatedAt);

    // Only use database on Vercel (where POSTGRES_URL is set)
    if (hasDatabase) {
      // Record each oracle's data to the database
      for (const oracle of oracles) {
        await recordOracleData(oracle);
      }

      // Get historical stats from DB
      const latestFromDb = await getLatestOracles();
      const statsMap = new Map(
        latestFromDb.map((o) => [
          o.oracleName,
          { updateCount: o.updateCount, lastChangeAt: o.lastChangeAt },
        ])
      );

      // Add stats to each oracle
      const oraclesWithStats = sortedOracles.map((oracle) => ({
        ...oracle,
        updateCount: statsMap.get(oracle.name)?.updateCount || 0,
        lastChangeAt: statsMap.get(oracle.name)?.lastChangeAt || null,
      }));

      return NextResponse.json({
        oracles: oraclesWithStats,
        fetchedAt: Math.floor(Date.now() / 1000),
      });
    }

    // Local dev: return oracles without DB stats
    return NextResponse.json({
      oracles: sortedOracles.map((oracle) => ({
        ...oracle,
        updateCount: 0,
        lastChangeAt: null,
      })),
      fetchedAt: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    console.error("Error fetching oracle data:", error);
    return NextResponse.json(
      { error: "Failed to fetch oracle data" },
      { status: 500 }
    );
  }
}
