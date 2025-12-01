import { NextRequest, NextResponse } from "next/server";
import { getOracleHistory, getRecentUpdates } from "@/app/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const oracleName = searchParams.get("oracle");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (oracleName) {
      // Get history for specific oracle
      const history = await getOracleHistory(oracleName, limit);
      return NextResponse.json({ oracle: oracleName, history });
    } else {
      // Get recent updates across all oracles
      const updates = await getRecentUpdates(limit);
      return NextResponse.json({ updates });
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
