import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Oracle Addresses | Oracle Monitor",
  description: "Complete list of oracle contract addresses and feed IDs on Monad Mainnet",
};

const btcOracles = [
  {
    name: "Chainlink",
    label: "CHAINLINK_BTC_USD",
    address: "0xc1d4C3331635184fA4C3c22fb92211B2Ac9E0546",
    type: "contract",
  },
  {
    name: "Pyth",
    label: "PYTH_CONTRACT",
    address: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    type: "contract",
  },
  {
    name: "Pyth",
    label: "PYTH_BTC_USD_FEED_ID",
    address: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    type: "feed_id",
  },
  {
    name: "Chronicle",
    label: "CHRONICLE_BTC_USD",
    address: "0xECd09Ce60c069384D6B91656A841097F1181A59e",
    type: "contract",
  },
  {
    name: "eOracle",
    label: "EORACLE_BTC_USD",
    address: "0xEB0CDef56e02A334B7eaB620560aDa727bB994f6",
    type: "contract",
  },
  {
    name: "Orocle",
    label: "OROCLE_CONTRACT",
    address: "0x78291455bf33aA5437f9D69Ff63E0B1C09833429",
    type: "contract",
  },
  {
    name: "Orocle",
    label: "OROCLE_BTC_IDENTIFIER",
    address: "0x4254430000000000000000000000000000000000",
    type: "identifier",
    note: '"BTC" as bytes20',
  },
  {
    name: "RedStone",
    label: "REDSTONE_BTC_USD",
    address: "0xED2B1ca5D7E246f615c2291De309643D41FeC97e",
    type: "contract",
  },
  {
    name: "Stork",
    label: "STORK_CONTRACT",
    address: "0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62",
    type: "contract",
  },
  {
    name: "Stork",
    label: "STORK_BTC_USD_ID",
    address: "0x7404e3d104ea7841c3d9e6fd20adfe99b4ad586bc08d8f3bd3afef894cf184de",
    type: "feed_id",
  },
  {
    name: "Supra",
    label: "SUPRA_CONTRACT",
    address: "0x58e158c74DF7Ad6396C0dcbadc4878faC9e93d57",
    type: "contract",
  },
  {
    name: "Supra",
    label: "SUPRA_BTC_USD_PAIR_ID",
    address: "18",
    type: "pair_id",
  },
];

const monOracles = [
  {
    name: "Chainlink",
    label: "CHAINLINK_MON_USD",
    address: "0xBcD78f76005B7515837af6b50c7C52BCf73822fb",
    type: "contract",
  },
  {
    name: "Pyth",
    label: "PYTH_MON_USD_FEED_ID",
    address: "0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1",
    type: "feed_id",
  },
  {
    name: "Chronicle",
    label: "CHRONICLE_MON_USD",
    address: "0x936a444C983347FFBfe3F26D1497CAbfA2BfE271",
    type: "contract",
  },
  {
    name: "Orocle",
    label: "OROCLE_MON_IDENTIFIER",
    address: "0x4D4F4E0000000000000000000000000000000000",
    type: "identifier",
    note: '"MON" as bytes20',
  },
  {
    name: "RedStone",
    label: "REDSTONE_MON_USD",
    address: "0x1C9582E87eD6E99bc23EC0e6Eb52eE9d7C0D6bcd",
    type: "contract",
  },
  {
    name: "Stork",
    label: "STORK_MON_USD_ID",
    address: "0xa4f6b07ae0c89e3f3cc03c1badcc3e9adffdf7206bafcd56d142979800887385",
    type: "feed_id",
  },
  {
    name: "Supra",
    label: "SUPRA_MON_USDT_PAIR_ID",
    address: "569",
    type: "pair_id",
  },
];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    contract: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    feed_id: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    identifier: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pair_id: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  const labels: Record<string, string> = {
    contract: "Contract",
    feed_id: "Feed ID",
    identifier: "Identifier",
    pair_id: "Pair ID",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] || "bg-zinc-100 dark:bg-zinc-800"}`}>
      {labels[type] || type}
    </span>
  );
}

function AddressTable({ oracles, title }: { oracles: typeof btcOracles; title: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-4 font-medium">Oracle</th>
                <th className="py-3 px-4 font-medium">Label</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Address / ID</th>
              </tr>
            </thead>
            <tbody>
              {oracles.map((oracle, index) => (
                <tr
                  key={`${oracle.label}-${index}`}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="py-3 px-4 font-semibold">{oracle.name}</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {oracle.label}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <TypeBadge type={oracle.type} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono break-all">{oracle.address}</code>
                      {oracle.note && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          ({oracle.note})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Oracle Addresses</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Complete list of oracle contract addresses and feed IDs on Monad Mainnet
          </p>
        </header>

        <AddressTable oracles={btcOracles} title="BTC/USD Oracles" />
        <AddressTable oracles={monOracles} title="MON/USD Oracles" />

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-10">
          <h2 className="text-xl font-bold mb-4">Network Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">Network:</span>
              <span className="font-semibold">Monad Mainnet</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">Chain ID:</span>
              <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">10143</code>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">RPC URL:</span>
              <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                https://rpc.monad.xyz
              </code>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Source code available on{" "}
            <a
              href="https://github.com/portdeveloper/oracle-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
