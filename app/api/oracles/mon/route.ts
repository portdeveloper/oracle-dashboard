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

export const dynamic = "force-dynamic";

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

    const oracles: OracleData[] = [chainlink, pyth, chronicle, orocle, redstone, stork, supra, eoracle];

    // Sort by freshness (most recent first), unsupported oracles go to the end
    const sortedOracles = oracles.sort((a, b) => {
      if (a.unsupported && !b.unsupported) return 1;
      if (!a.unsupported && b.unsupported) return -1;
      return b.updatedAt - a.updatedAt;
    });

    return NextResponse.json({
      oracles: sortedOracles,
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
