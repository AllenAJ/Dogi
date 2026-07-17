import type { IAssetsResponse } from "@particle-network/universal-account-sdk";
import type { RouteSummary } from "@/lib/route";
import type { ReceivedPayment } from "@/lib/payments";
import { CHAIN_NAMES } from "@/lib/config";

/**
 * Simulated-demo mode for recording walkthroughs without funded accounts.
 * Set NEXT_PUBLIC_DEMO_MODE=1 (local only, never in production). Login stays
 * real; balances, routes, payments, and the feed are simulated, and a visible
 * badge says so.
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

type DemoHolding = {
  tokenType: string;
  symbol: string;
  chainId: number;
  price: number;
  amount: number;
};

// Mutable so payments visibly reduce the payer's balance during a recording.
const holdings: DemoHolding[] = [
  { tokenType: "eth", symbol: "ETH", chainId: 8453, price: 3100, amount: 0.0082 },
  { tokenType: "usdc", symbol: "USDC", chainId: 1, price: 1, amount: 18.4 },
  { tokenType: "sol", symbol: "SOL", chainId: 101, price: 155, amount: 0.062 },
  { tokenType: "usdt", symbol: "USDT", chainId: 56, price: 1, amount: 4.2 },
];

const token = (h: DemoHolding) => ({
  chainId: h.chainId,
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  realDecimals: 18,
  symbol: h.symbol,
});

export function demoPrimaryAssets(): IAssetsResponse {
  const assets = holdings
    .filter((h) => h.amount > 0)
    .map((h) => ({
      tokenType: h.tokenType,
      price: h.price,
      amount: h.amount,
      amountInUSD: h.amount * h.price,
      chainAggregation: [
        {
          token: token(h),
          amount: h.amount,
          amountInUSD: h.amount * h.price,
          rawAmount: h.amount,
        },
      ],
    }));
  return {
    assets,
    totalAmountInUSD: assets.reduce((sum, a) => sum + a.amountInUSD, 0),
  } as unknown as IAssetsResponse;
}

/** Quote a plausible multi-chain route: drain holdings in order until covered. */
export function demoRoute(amountUsd: number): RouteSummary {
  const fee = Math.max(0.05, amountUsd * 0.008);
  let remaining = amountUsd + fee;
  const sources = [];
  for (const h of holdings) {
    if (remaining <= 0.001 || h.amount <= 0) continue;
    const availableUsd = h.amount * h.price;
    const takeUsd = Math.min(availableUsd, remaining);
    remaining -= takeUsd;
    sources.push({
      symbol: h.symbol,
      chainId: h.chainId,
      chainName: CHAIN_NAMES[h.chainId] ?? `chain ${h.chainId}`,
      amount: takeUsd / h.price,
      amountInUSD: takeUsd,
    });
  }
  return {
    sources,
    feeInUSD: fee,
    totalPaidInUSD: amountUsd + fee,
    chainCount: new Set(sources.map((s) => s.chainId)).size,
  };
}

/** Apply a quoted route to the demo balance so it visibly drops after paying. */
export function demoSpend(route: RouteSummary) {
  for (const source of route.sources) {
    const h = holdings.find(
      (h) => h.chainId === source.chainId && h.symbol === source.symbol,
    );
    if (h) h.amount = Math.max(0, h.amount - source.amount);
  }
}

export const demoDelay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const demoTransactionId = () =>
  `demo-${Math.random().toString(36).slice(2, 10)}`;

/** A plausible incoming-payments feed for the creator dashboard. */
export function demoReceivedPayments(): ReceivedPayment[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    { txHash: "0xdemo1", from: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72", amount: 15, blockNumber: 1, timestamp: now - 240 },
    { txHash: "0xdemo2", from: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30", amount: 25, blockNumber: 1, timestamp: now - 7500 },
    { txHash: "0xdemo3", from: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E", amount: 5, blockNumber: 1, timestamp: now - 86400 },
  ];
}
