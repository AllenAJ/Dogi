"use client";

import type { RouteSummary } from "@/lib/route";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import { SETTLEMENT_CHAIN_LABEL } from "@/lib/config";

/**
 * Visualizes the cross-chain route the Universal Account quoted:
 * which tokens on which chains fund the payment → USDC on the settlement chain.
 */
export function RouteCard({
  route,
  amountUsd,
  compact = false,
}: {
  route: RouteSummary;
  /** The amount the receiver gets, in USD. */
  amountUsd: number;
  /** Tighter layout for success states. */
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-raised text-left ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        {compact ? "How it was paid" : "Where it comes from"}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {route.sources.map((source) => (
          <li
            key={`${source.symbol}-${source.chainId}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="font-semibold">
              {formatTokenAmount(source.amount)} {source.symbol}
              <span className="ml-1.5 font-normal text-muted">on {source.chainName}</span>
            </span>
            <span className="tabular-nums text-muted">{formatUsd(source.amountInUSD)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm">
        <span className="text-muted" aria-hidden="true">
          ↓
        </span>
        <span className="font-semibold">
          {formatUsd(amountUsd)} USDC
          <span className="ml-1.5 font-normal text-muted">on {SETTLEMENT_CHAIN_LABEL}</span>
        </span>
        {route.chainCount > 1 ? (
          <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
            {route.chainCount} chains, one tap
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted">
        <div className="flex items-center justify-between">
          <span>Bridging, swaps &amp; gas</span>
          <span className="tabular-nums">
            {route.feeInUSD > 0 && route.feeInUSD < 0.01 ? "<$0.01" : formatUsd(route.feeInUSD)}
          </span>
        </div>
        <div className="flex items-center justify-between font-semibold text-foreground">
          <span>Total from your balance</span>
          <span className="tabular-nums">{formatUsd(route.totalPaidInUSD)}</span>
        </div>
      </div>
    </div>
  );
}
