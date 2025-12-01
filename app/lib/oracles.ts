import { createPublicClient, http, parseAbi } from "viem";
import { defineChain } from "viem";

// Define Monad Mainnet
export const monadMainnet = defineChain({
  id: 10143,
  name: "Monad Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz"],
    },
  },
});

// Create client
export const client = createPublicClient({
  chain: monadMainnet,
  transport: http(),
});

// Contract addresses
export const CHAINLINK_BTC_USD = "0xc1d4C3331635184fA4C3c22fb92211B2Ac9E0546" as const;
export const PYTH_CONTRACT = "0x2880aB155794e7179c9eE2e38200202908C17B43" as const;
export const PYTH_BTC_USD_FEED_ID = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" as const;
export const CHRONICLE_BTC_USD = "0xECd09Ce60c069384D6B91656A841097F1181A59e" as const;
export const EORACLE_BTC_USD = "0xEB0CDef56e02A334B7eaB620560aDa727bB994f6" as const;
export const OROCLE_CONTRACT = "0x78291455bf33aA5437f9D69Ff63E0B1C09833429" as const;
// BTC identifier for Orocle: "BTC" as bytes20
export const OROCLE_BTC_IDENTIFIER = "0x4254430000000000000000000000000000000000" as const;
export const REDSTONE_BTC_USD = "0xED2B1ca5D7E246f615c2291De309643D41FeC97e" as const;
export const STORK_CONTRACT = "0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62" as const;
export const STORK_BTC_USD_ID = "0x7404e3d104ea7841c3d9e6fd20adfe99b4ad586bc08d8f3bd3afef894cf184de" as const;
export const SUPRA_CONTRACT = "0x58e158c74DF7Ad6396C0dcbadc4878faC9e93d57" as const;
export const SUPRA_BTC_USD_PAIR_ID = 18n; // BTC/USD pair ID
export const SWITCHBOARD_CONTRACT = "0x63B27c427F7a1528e4CF9b2d2C6802F88b78FC09" as const;
export const SWITCHBOARD_BTC_USD_FEED_ID = "0x4cd1cad962425681af07b9254b7d804de3ca3446fbfd1371bb258d2c75059812" as const;

// Chainlink ABI (minimal - just what we need)
export const chainlinkAbi = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
]);

// Pyth ABI (minimal)
export const pythAbi = parseAbi([
  "function getPrice(bytes32 id) external view returns ((int64 price, uint64 conf, int32 expo, uint256 publishTime))",
]);

// Chronicle ABI (minimal)
export const chronicleAbi = parseAbi([
  "function readWithAge() external view returns (uint256 value, uint256 age)",
]);

// Orocle ABI (minimal)
export const orocleAbi = parseAbi([
  "function getLatestRound(uint32 appId, bytes20 identifier) external view returns (uint64 round, uint256 lastUpdate, uint256 data)",
]);

// Stork ABI (minimal)
export const storkAbi = parseAbi([
  "function getTemporalNumericValueV1(bytes32 id) external view returns ((uint256 timestampNs, int192 quantizedValue))",
]);

// Supra ABI (minimal)
export const supraAbi = parseAbi([
  "function getSvalue(uint256 _pairIndex) external view returns ((uint256 round, uint256 decimals, uint256 time, uint256 price))",
]);

// Switchboard ABI (minimal)
export const switchboardAbi = parseAbi([
  "function latestUpdate(bytes32 aggregatorId) external view returns ((int128 result, uint128 timestamp))",
]);

export interface OracleData {
  name: string;
  price: number;
  updatedAt: number; // unix timestamp in seconds
  decimals: number;
  rawPrice: string;
}

export async function fetchChainlinkData(): Promise<OracleData> {
  const [roundData, decimals] = await Promise.all([
    client.readContract({
      address: CHAINLINK_BTC_USD,
      abi: chainlinkAbi,
      functionName: "latestRoundData",
    }),
    client.readContract({
      address: CHAINLINK_BTC_USD,
      abi: chainlinkAbi,
      functionName: "decimals",
    }),
  ]);

  const [, answer, , updatedAt] = roundData;
  const price = Number(answer) / Math.pow(10, decimals);

  return {
    name: "Chainlink",
    price,
    updatedAt: Number(updatedAt),
    decimals,
    rawPrice: answer.toString(),
  };
}

export async function fetchPythData(): Promise<OracleData> {
  const priceData = await client.readContract({
    address: PYTH_CONTRACT,
    abi: pythAbi,
    functionName: "getPrice",
    args: [PYTH_BTC_USD_FEED_ID],
  });

  const { price, expo, publishTime } = priceData;
  const formattedPrice = Number(price) * Math.pow(10, expo);

  return {
    name: "Pyth",
    price: formattedPrice,
    updatedAt: Number(publishTime),
    decimals: Math.abs(expo),
    rawPrice: price.toString(),
  };
}

export async function fetchChronicleData(): Promise<OracleData> {
  const [value, age] = await client.readContract({
    address: CHRONICLE_BTC_USD,
    abi: chronicleAbi,
    functionName: "readWithAge",
  });

  // Chronicle uses 18 decimals
  const price = Number(value) / Math.pow(10, 18);

  return {
    name: "Chronicle",
    price,
    updatedAt: Number(age),
    decimals: 18,
    rawPrice: value.toString(),
  };
}

export async function fetchEOracleData(): Promise<OracleData> {
  // eOracle is Chainlink-compatible (AggregatorV3Interface)
  const [roundData, decimals] = await Promise.all([
    client.readContract({
      address: EORACLE_BTC_USD,
      abi: chainlinkAbi,
      functionName: "latestRoundData",
    }),
    client.readContract({
      address: EORACLE_BTC_USD,
      abi: chainlinkAbi,
      functionName: "decimals",
    }),
  ]);

  const [, answer, , updatedAt] = roundData;
  const price = Number(answer) / Math.pow(10, decimals);

  return {
    name: "eOracle",
    price,
    updatedAt: Number(updatedAt),
    decimals,
    rawPrice: answer.toString(),
  };
}

export async function fetchOrocleData(): Promise<OracleData> {
  const [, lastUpdate, data] = await client.readContract({
    address: OROCLE_CONTRACT,
    abi: orocleAbi,
    functionName: "getLatestRound",
    args: [1, OROCLE_BTC_IDENTIFIER], // appId=1 for asset prices
  });

  // Orocle uses 18 decimals
  const price = Number(data) / Math.pow(10, 18);

  return {
    name: "Orocle",
    price,
    updatedAt: Number(lastUpdate),
    decimals: 18,
    rawPrice: data.toString(),
  };
}

export async function fetchRedstoneData(): Promise<OracleData> {
  // Try Chainlink-compatible interface first
  const [roundData, decimals] = await Promise.all([
    client.readContract({
      address: REDSTONE_BTC_USD,
      abi: chainlinkAbi,
      functionName: "latestRoundData",
    }),
    client.readContract({
      address: REDSTONE_BTC_USD,
      abi: chainlinkAbi,
      functionName: "decimals",
    }),
  ]);

  const [, answer, , updatedAt] = roundData;
  const price = Number(answer) / Math.pow(10, decimals);

  return {
    name: "RedStone",
    price,
    updatedAt: Number(updatedAt),
    decimals,
    rawPrice: answer.toString(),
  };
}

export async function fetchStorkData(): Promise<OracleData> {
  const result = await client.readContract({
    address: STORK_CONTRACT,
    abi: storkAbi,
    functionName: "getTemporalNumericValueV1",
    args: [STORK_BTC_USD_ID],
  });

  const { timestampNs, quantizedValue } = result;
  // Stork uses 18 decimals and timestamp in nanoseconds
  const price = Number(quantizedValue) / Math.pow(10, 18);
  const updatedAt = Number(timestampNs) / 1_000_000_000; // ns to seconds

  return {
    name: "Stork",
    price,
    updatedAt: Math.floor(updatedAt),
    decimals: 18,
    rawPrice: quantizedValue.toString(),
  };
}

export async function fetchSupraData(): Promise<OracleData> {
  const result = await client.readContract({
    address: SUPRA_CONTRACT,
    abi: supraAbi,
    functionName: "getSvalue",
    args: [SUPRA_BTC_USD_PAIR_ID],
  });

  const { decimals, time, price } = result;
  const formattedPrice = Number(price) / Math.pow(10, Number(decimals));
  // Supra timestamp is in milliseconds, convert to seconds
  const updatedAt = Number(time) / 1000;

  return {
    name: "Supra",
    price: formattedPrice,
    updatedAt: Math.floor(updatedAt),
    decimals: Number(decimals),
    rawPrice: price.toString(),
  };
}

export async function fetchSwitchboardData(): Promise<OracleData> {
  const result = await client.readContract({
    address: SWITCHBOARD_CONTRACT,
    abi: switchboardAbi,
    functionName: "latestUpdate",
    args: [SWITCHBOARD_BTC_USD_FEED_ID],
  });

  const { result: price, timestamp } = result;
  // Switchboard uses 18 decimals (result is decimal * 10^18)
  const formattedPrice = Number(price) / Math.pow(10, 18);

  return {
    name: "Switchboard",
    price: formattedPrice,
    updatedAt: Number(timestamp),
    decimals: 18,
    rawPrice: price.toString(),
  };
}

export async function fetchAllOracles(): Promise<{
  chainlink: OracleData;
  pyth: OracleData;
  chronicle: OracleData;
  eoracle: OracleData;
  orocle: OracleData;
  redstone: OracleData;
  stork: OracleData;
  supra: OracleData;
  switchboard: OracleData;
}> {
  const [chainlink, pyth, chronicle, eoracle, orocle, redstone, stork, supra, switchboard] = await Promise.all([
    fetchChainlinkData(),
    fetchPythData(),
    fetchChronicleData(),
    fetchEOracleData(),
    fetchOrocleData(),
    fetchRedstoneData(),
    fetchStorkData(),
    fetchSupraData(),
    fetchSwitchboardData(),
  ]);

  return { chainlink, pyth, chronicle, eoracle, orocle, redstone, stork, supra, switchboard };
}
