import { NextResponse } from "next/server";
import {
  fetchChainlinkMonUsd,
  fetchPythMonUsd,
  fetchRedstoneMonUsd,
  fetchStorkMonUsd,
  fetchSupraMonUsd,
  fetchChronicleMonUsd,
  fetchOrocleMonUsd,
  type OracleData
} from "@/app/lib/oracles";
import { recordOracleData, getLatestOracles } from "@/app/db";

export const dynamic = "force-dynamic";

// Check if database is available (Vercel Postgres env var)
const hasDatabase = !!process.env.POSTGRES_URL;

// Add MON prefix to oracle name for database storage
function withMonPrefix(oracle: OracleData): OracleData {
  return { ...oracle, name: `${oracle.name} (MON)` };
}

export async function GET() {
  try {
    const [chainlink, pyth, redstone, stork, supra, chronicle, orocle] = await Promise.all([
      fetchChainlinkMonUsd(),
      fetchPythMonUsd(),
      fetchRedstoneMonUsd(),
      fetchStorkMonUsd(),
      fetchSupraMonUsd(),
      fetchChronicleMonUsd(),
      fetchOrocleMonUsd(),
    ]);

    // eOracle doesn't support MON/USD
    const eoracle: OracleData = {
      name: "eOracle",
      price: 0,
      updatedAt: 0,
      decimals: 0,
      rawPrice: "0",
      unsupported: true,
    };

    // Add MON prefix for storage/display distinction
    const oraclesWithPrefix = [chainlink, pyth, chronicle, orocle, redstone, stork, supra].map(withMonPrefix);
    const eoracleWithPrefix = { ...eoracle, name: "eOracle (MON)" };

    const oracles: OracleData[] = [...oraclesWithPrefix, eoracleWithPrefix];

    // Sort by freshness (most recent first), unsupported oracles go to the end
    const sortedOracles = oracles.sort((a, b) => {
      if (a.unsupported && !b.unsupported) return 1;
      if (!a.unsupported && b.unsupported) return -1;
      return b.updatedAt - a.updatedAt;
    });

    // Only use database on Vercel (where POSTGRES_URL is set)
    if (hasDatabase) {
      // Record each oracle's data to the database (skip unsupported)
      for (const oracle of oraclesWithPrefix) {
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
    console.error("Error fetching MON/USD oracle data:", error);
    return NextResponse.json(
      { error: "Failed to fetch MON/USD oracle data" },
      { status: 500 }
    );
  }
}
