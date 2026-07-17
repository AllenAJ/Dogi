import type { ITransaction, ITokenWithUSD } from "@particle-network/universal-account-sdk";
import { CHAIN_NAMES } from "./config";

export type RouteSource = {
  symbol: string;
  chainId: number;
  chainName: string;
  amount: number;
  amountInUSD: number;
};

/**
 * Human-readable summary of the cross-chain route the UA SDK quoted:
 * which tokens on which chains fund the payment, and what it costs.
 */
export type RouteSummary = {
  sources: RouteSource[];
  /** Total protocol + gas fees in USD. */
  feeInUSD: number;
  /** Everything leaving the payer's balance (amount + fees) in USD. */
  totalPaidInUSD: number;
  /** Number of distinct chains funds are drawn from. */
  chainCount: number;
};

const toSource = (t: ITokenWithUSD): RouteSource => ({
  symbol: (t.token.symbol ?? t.token.type ?? "token").toUpperCase(),
  chainId: t.token.chainId,
  chainName: CHAIN_NAMES[t.token.chainId] ?? `chain ${t.token.chainId}`,
  amount: Number(t.amount),
  amountInUSD: Number(t.amountInUSD),
});

export function summarizeRoute(transaction: ITransaction): RouteSummary | null {
  const changes = transaction.tokenChanges;
  if (!changes || !Array.isArray(changes.decr)) return null;

  const sources = changes.decr
    .map(toSource)
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amountInUSD - a.amountInUSD);
  if (sources.length === 0) return null;

  return {
    sources,
    feeInUSD: Number(changes.totalFeeInUSD) || 0,
    totalPaidInUSD: Number(changes.totalPaidAmountInUSD) || 0,
    chainCount: new Set(sources.map((s) => s.chainId)).size,
  };
}
