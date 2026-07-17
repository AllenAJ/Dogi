import { Contract, JsonRpcProvider, type EventLog } from "ethers";
import {
  ARBITRUM_RPC_URL,
  ARBITRUM_USDC_ADDRESS,
} from "@/lib/config";

export type ReceivedPayment = {
  txHash: string;
  from: string;
  /** Human-readable USDC amount. */
  amount: number;
  blockNumber: number;
  /** Unix seconds; null when the block lookup failed. */
  timestamp: number | null;
};

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
];

// Arbitrum produces ~4 blocks/s, so ~1M blocks ≈ 3 days. Public RPCs differ in how
// large a getLogs range they accept, so fall back to narrower windows on error.
const LOOKBACK_RANGES = [1_000_000, 100_000, 10_000];
const MAX_ITEMS = 8;

/** Recent incoming USDC transfers to `address` on the settlement chain, newest first. */
export async function fetchReceivedPayments(address: string): Promise<ReceivedPayment[]> {
  const provider = new JsonRpcProvider(ARBITRUM_RPC_URL);
  const usdc = new Contract(ARBITRUM_USDC_ADDRESS, ERC20_ABI, provider);

  const [latest, decimals] = await Promise.all([
    provider.getBlockNumber(),
    usdc.decimals().then(Number).catch(() => 6),
  ]);

  let logs: EventLog[] | null = null;
  for (const range of LOOKBACK_RANGES) {
    try {
      const found = await usdc.queryFilter(
        usdc.filters.Transfer(null, address),
        Math.max(0, latest - range),
        latest,
      );
      logs = found as EventLog[];
      break;
    } catch {
      // Range too large for this RPC, try a narrower window.
    }
  }
  if (!logs) return [];

  const recent = logs.slice(-MAX_ITEMS).reverse();
  const divisor = 10 ** decimals;

  return Promise.all(
    recent.map(async (log) => {
      const timestamp = await provider
        .getBlock(log.blockNumber)
        .then((b) => b?.timestamp ?? null)
        .catch(() => null);
      return {
        txHash: log.transactionHash,
        from: String(log.args[0]),
        amount: Number(log.args[2]) / divisor,
        blockNumber: log.blockNumber,
        timestamp,
      };
    }),
  );
}

export function timeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
