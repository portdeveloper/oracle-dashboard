"use client";

import { useEffect, useState, useCallback } from "react";

interface OracleData {
  name: string;
  price: number;
  updatedAt: number;
  decimals: number;
  rawPrice: string;
  updateCount?: number;
  lastChangeAt?: number | null;
  unsupported?: boolean;
}

interface HistoryEntry {
  id: number;
  oracleName: string;
  price: number;
  updatedAt: number;
  recordedAt: number;
  decimals: number;
  rawPrice: string;
}

interface OracleResponse {
  oracles: OracleData[];
  fetchedAt: number;
}

function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatTimeSince(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s ago`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Shows update frequency - each bar represents time gap between updates
function UpdateFrequencyChart({ timestamps }: { timestamps: number[] }) {
  if (!timestamps || timestamps.length < 2) {
    return (
      <div className="w-28 h-8 flex items-end gap-px">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-sm h-2" />
        ))}
      </div>
    );
  }

  // Calculate intervals between consecutive updates (in seconds)
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  // Get last 15 intervals for display
  const displayIntervals = intervals.slice(-15);
  const maxInterval = Math.max(...displayIntervals, 60); // Cap at 60s for scale

  return (
    <div className="w-28 h-8 flex items-end gap-px" title="Update intervals (shorter = more frequent)">
      {displayIntervals.map((interval, i) => {
        // Invert: shorter interval = taller bar (more frequent updates are good)
        const normalizedHeight = Math.max(0.1, 1 - Math.min(interval, maxInterval) / maxInterval);
        const color = interval <= 10 ? "#22c55e" : interval <= 30 ? "#eab308" : "#ef4444";

        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${normalizedHeight * 100}%`,
              backgroundColor: color,
              minHeight: "2px",
            }}
          />
        );
      })}
    </div>
  );
}

function HistoryModal({
  oracleName,
  onClose,
}: {
  oracleName: string;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isMonOracle = oracleName.includes("(MON)");
  const priceDecimals = isMonOracle ? 6 : 2;

  useEffect(() => {
    fetch(`/api/oracles/history?oracle=${encodeURIComponent(oracleName)}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [oracleName]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">{oracleName} History</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-center text-zinc-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-zinc-500">No history available yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900">
                <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Oracle Time</th>
                  <th className="pb-2 font-medium">Recorded</th>
                  <th className="pb-2 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => {
                  const prevEntry = history[index + 1];
                  const priceChange = prevEntry
                    ? ((entry.price - prevEntry.price) / prevEntry.price) * 100
                    : 0;

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="py-2 font-mono font-medium">
                        {formatPrice(entry.price, priceDecimals)}
                      </td>
                      <td className="py-2 text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(entry.updatedAt)}
                      </td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-500 text-xs">
                        {formatTimeSince(entry.recordedAt)}
                      </td>
                      <td
                        className={`py-2 text-right font-mono ${
                          priceChange > 0
                            ? "text-green-500"
                            : priceChange < 0
                            ? "text-red-500"
                            : "text-zinc-400"
                        }`}
                      >
                        {priceChange !== 0 && (
                          <>
                            {priceChange > 0 ? "+" : ""}
                            {priceChange.toFixed(4)}%
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          Showing last {history.length} updates
        </div>
      </div>
    </div>
  );
}

function OracleRow({
  data,
  currentTime,
  referencePrice,
  rank,
  onViewHistory,
  updateTimestamps,
  priceDecimals = 2,
}: {
  data: OracleData;
  currentTime: number;
  referencePrice?: number;
  rank: number;
  onViewHistory: () => void;
  updateTimestamps: number[];
  priceDecimals?: number;
}) {
  const timeSinceUpdate = currentTime - data.updatedAt;
  const isStale = timeSinceUpdate > 60;
  const deviation = referencePrice && !data.unsupported
    ? ((data.price - referencePrice) / referencePrice) * 100
    : null;

  if (data.unsupported) {
    return (
      <tr className="border-b border-zinc-100 dark:border-zinc-800 opacity-50">
        <td className="py-4 pl-4">
          <div className="w-8 h-8 rounded-full bg-zinc-400 dark:bg-zinc-600 text-white dark:text-black text-sm font-bold flex items-center justify-center">
            {rank}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span className="font-semibold text-lg">{data.name}</span>
          </div>
        </td>
        <td className="py-4 px-4" colSpan={4}>
          <p className="text-zinc-500 italic">Not supported</p>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      {/* Rank */}
      <td className="py-4 pl-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black text-sm font-bold flex items-center justify-center">
          {rank}
        </div>
      </td>

      {/* Oracle Name & Status */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full ${
              isStale ? "bg-yellow-500" : "bg-green-500"
            } animate-pulse`}
          />
          <span className="font-semibold text-lg">{data.name}</span>
        </div>
      </td>

      {/* Price */}
      <td className="py-4 px-4">
        <div>
          <p className="text-xl font-mono font-bold">{formatPrice(data.price, priceDecimals)}</p>
          {deviation !== null && (
            <p
              className={`text-xs ${
                Math.abs(deviation) > 0.1
                  ? deviation > 0
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-zinc-500"
              }`}
            >
              {deviation >= 0 ? "+" : ""}
              {deviation.toFixed(3)}% vs ref
            </p>
          )}
        </div>
      </td>

      {/* Update Frequency Chart */}
      <td className="py-4 px-4">
        <UpdateFrequencyChart timestamps={updateTimestamps} />
      </td>

      {/* Time Since Update */}
      <td className="py-4 px-4">
        <p
          className={`text-2xl font-mono font-bold ${
            timeSinceUpdate > 30
              ? timeSinceUpdate > 60
                ? "text-red-500"
                : "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {timeSinceUpdate}s
        </p>
      </td>

      {/* Updates & Action */}
      <td className="py-4 pr-4 text-right">
        {data.updateCount !== undefined && data.updateCount > 0 && (
          <button
            onClick={onViewHistory}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {data.updateCount} updates
          </button>
        )}
      </td>
    </tr>
  );
}

export default function Home() {
  const [data, setData] = useState<OracleResponse | null>(null);
  const [monData, setMonData] = useState<OracleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [binancePrice, setBinancePrice] = useState<number | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);
  const [updateTimestamps, setUpdateTimestamps] = useState<Record<string, number[]>>({});
  const [monUpdateTimestamps, setMonUpdateTimestamps] = useState<Record<string, number[]>>({});

  const fetchOracles = useCallback(async () => {
    try {
      const res = await fetch("/api/oracles");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);

      // Update timestamps for frequency chart (keep last 30 data points)
      setUpdateTimestamps((prev) => {
        const updated = { ...prev };
        for (const oracle of json.oracles) {
          const existing = updated[oracle.name] || [];
          // Only add if updatedAt changed (new push from oracle)
          if (existing.length === 0 || existing[existing.length - 1] !== oracle.updatedAt) {
            updated[oracle.name] = [...existing.slice(-29), oracle.updatedAt];
          }
        }
        return updated;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, []);

  const fetchMonOracles = useCallback(async () => {
    try {
      const res = await fetch("/api/oracles/mon");
      if (!res.ok) throw new Error("Failed to fetch MON/USD");
      const json = await res.json();
      setMonData(json);

      // Update timestamps for frequency chart
      setMonUpdateTimestamps((prev) => {
        const updated = { ...prev };
        for (const oracle of json.oracles) {
          const existing = updated[oracle.name] || [];
          if (existing.length === 0 || existing[existing.length - 1] !== oracle.updatedAt) {
            updated[oracle.name] = [...existing.slice(-29), oracle.updatedAt];
          }
        }
        return updated;
      });
    } catch (e) {
      console.error("MON/USD fetch error:", e);
    }
  }, []);

  const fetchBinance = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      if (!res.ok) throw new Error("Failed to fetch Binance");
      const json = await res.json();
      setBinancePrice(parseFloat(json.price));
    } catch (e) {
      console.error("Binance error:", e);
    }
  }, []);

  // Fetch initial history for frequency chart
  const fetchInitialHistory = useCallback(async () => {
    try {
      const oracles = ["Chainlink", "Pyth", "Chronicle", "eOracle", "Orocle", "RedStone", "Stork", "Supra", "Switchboard"];
      const historyPromises = oracles.map(async (name) => {
        const res = await fetch(`/api/oracles/history?oracle=${encodeURIComponent(name)}&limit=30`);
        const data = await res.json();
        return { name, history: data.history || [] };
      });

      const results = await Promise.all(historyPromises);
      const timestampMap: Record<string, number[]> = {};

      for (const { name, history } of results) {
        // History is returned newest first, so reverse it for the chart
        // Use updatedAt (oracle timestamp) not recordedAt
        timestampMap[name] = history.map((h: HistoryEntry) => h.updatedAt).reverse();
      }

      setUpdateTimestamps(timestampMap);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  }, []);

  // Fetch initial history for MON/USD frequency chart
  const fetchInitialMonHistory = useCallback(async () => {
    try {
      const oracles = ["Chainlink (MON)", "Pyth (MON)", "Chronicle (MON)", "Orocle (MON)", "RedStone (MON)", "Stork (MON)", "Supra (MON)", "Switchboard (MON)"];
      const historyPromises = oracles.map(async (name) => {
        const res = await fetch(`/api/oracles/history?oracle=${encodeURIComponent(name)}&limit=30`);
        const data = await res.json();
        return { name, history: data.history || [] };
      });

      const results = await Promise.all(historyPromises);
      const timestampMap: Record<string, number[]> = {};

      for (const { name, history } of results) {
        timestampMap[name] = history.map((h: HistoryEntry) => h.updatedAt).reverse();
      }

      setMonUpdateTimestamps(timestampMap);
    } catch (e) {
      console.error("Failed to fetch MON history:", e);
    }
  }, []);

  useEffect(() => {
    fetchOracles();
    fetchMonOracles();
    fetchBinance();
    fetchInitialHistory();
    fetchInitialMonHistory();

    const oracleInterval = setInterval(fetchOracles, 1000);
    const monOracleInterval = setInterval(fetchMonOracles, 1000);
    const binanceInterval = setInterval(fetchBinance, 1000);
    const timeInterval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      clearInterval(oracleInterval);
      clearInterval(monOracleInterval);
      clearInterval(binanceInterval);
      clearInterval(timeInterval);
    };
  }, [fetchOracles, fetchMonOracles, fetchBinance, fetchInitialHistory, fetchInitialMonHistory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Oracle Monitor</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Monad Mainnet • Polling every 1s • Sorted by freshness
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            Error: {error}
          </div>
        )}

        {data ? (
          <>
            {/* Reference Price Bar */}
            <div className="mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Reference (Binance):
                </span>
                <span className="text-2xl font-mono font-bold">
                  {binancePrice ? formatPrice(binancePrice) : "Loading..."}
                </span>
              </div>
              <span className="text-xs text-zinc-400">Real-time</span>
            </div>

            {/* BTC/USD Section */}
            <h2 className="text-xl font-bold mb-4">BTC/USD</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-sm text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 pl-4 font-medium w-16">#</th>
                    <th className="py-3 px-4 font-medium">Oracle</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Push Frequency</th>
                    <th className="py-3 px-4 font-medium">Freshness</th>
                    <th className="py-3 pr-4 font-medium text-right">History</th>
                  </tr>
                </thead>
                <tbody>
                  {data.oracles.map((oracle, index) => (
                    <OracleRow
                      key={oracle.name}
                      data={oracle}
                      currentTime={currentTime}
                      referencePrice={binancePrice ?? undefined}
                      rank={index + 1}
                      onViewHistory={() => setSelectedOracle(oracle.name)}
                      updateTimestamps={updateTimestamps[oracle.name] || []}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MON/USD Section */}
            {monData && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">MON/USD</h2>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-sm text-zinc-500 dark:text-zinc-400">
                        <th className="py-3 pl-4 font-medium w-16">#</th>
                        <th className="py-3 px-4 font-medium">Oracle</th>
                        <th className="py-3 px-4 font-medium">Price</th>
                        <th className="py-3 px-4 font-medium">Push Frequency</th>
                        <th className="py-3 px-4 font-medium">Freshness</th>
                        <th className="py-3 pr-4 font-medium text-right">History</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monData.oracles.map((oracle, index) => (
                        <OracleRow
                          key={`mon-${oracle.name}`}
                          data={oracle}
                          currentTime={currentTime}
                          rank={index + 1}
                          onViewHistory={() => setSelectedOracle(oracle.name)}
                          updateTimestamps={monUpdateTimestamps[oracle.name] || []}
                          priceDecimals={6}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Switchboard Note */}
            <div className="mt-6 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/50">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold">Switchboard</span> (0x63B27C427F7A1528e4cF9B2D2c6802F88b78FC09) - I couldn&apos;t get this one working properly. If you know how to integrate it, please{" "}
                <a
                  href="https://github.com/portdeveloper/oracle-dashboard/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  open a PR
                </a>
                !
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500">Loading oracle data...</p>
          </div>
        )}

      </div>

      {selectedOracle && (
        <HistoryModal
          oracleName={selectedOracle}
          onClose={() => setSelectedOracle(null)}
        />
      )}
    </div>
  );
}
