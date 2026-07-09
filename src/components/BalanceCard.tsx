"use client";

import { useState } from "react";
import { useUniversalAccount } from "@/providers/UniversalAccountProvider";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import { CHAIN_NAMES, IS_TESTNET_SETTLEMENT, SETTLEMENT_CHAIN_LABEL } from "@/lib/config";
import { InlineDog } from "./Mascot";

export function BalanceCard() {
  const { primaryAssets, onChainNativeEth, balanceLoading, refreshBalance } =
    useUniversalAccount();
  const [expanded, setExpanded] = useState(false);

  const assets = (primaryAssets?.assets ?? []).filter((a) => a.amount > 0);
  const usdTotal = primaryAssets?.totalAmountInUSD ?? 0;
  const nativeEth = onChainNativeEth ?? 0;
  const hasOnChainEth = IS_TESTNET_SETTLEMENT && nativeEth > 0;
  const showEthPrimary = hasOnChainEth && usdTotal === 0 && assets.length === 0;
  const isEmpty = primaryAssets !== null && !balanceLoading && usdTotal === 0 && assets.length === 0 && !hasOnChainEth;

  return (
    <section className="rounded-3xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-muted">Balance across all chains</h2>
          {primaryAssets === null && balanceLoading ? (
            <div className="mt-2 flex items-center gap-2">
              <InlineDog size={28} />
              <span className="text-sm text-muted">Fetching balance…</span>
            </div>
          ) : showEthPrimary ? (
            <>
              <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
                {formatTokenAmount(nativeEth)} ETH
              </p>
              <p className="mt-1 text-sm text-muted">on {SETTLEMENT_CHAIN_LABEL}</p>
            </>
          ) : (
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
              {formatUsd(usdTotal)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refreshBalance}
          disabled={balanceLoading}
          aria-label="Refresh balance"
          className="flex size-10 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {balanceLoading ? (
            <InlineDog size={22} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
              <path
                d="M20 11a8 8 0 10.7 4M20 5v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {hasOnChainEth && usdTotal === 0 ? (
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted">
          Testnet mode: showing on-chain ETH from {SETTLEMENT_CHAIN_LABEL}. USD totals from
          Particle may still read $0.00.
        </p>
      ) : null}

      {assets.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md text-xs font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={expanded}
          >
            {expanded ? "Hide breakdown" : `Where it lives (${assets.length} asset${assets.length > 1 ? "s" : ""})`}
          </button>
          {expanded ? (
            <ul className="mt-3 flex flex-col gap-2">
              {assets.map((asset) => (
                <li key={asset.tokenType} className="rounded-2xl bg-surface-raised p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold uppercase">{asset.tokenType}</span>
                    <span className="tabular-nums">{formatUsd(asset.amountInUSD)}</span>
                  </div>
                  <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {asset.chainAggregation
                      .filter((c) => c.amount > 0)
                      .map((c) => (
                        <li key={`${asset.tokenType}-${c.token.chainId}`} className="text-xs text-muted tabular-nums">
                          {formatTokenAmount(c.amount)} on{" "}
                          {CHAIN_NAMES[c.token.chainId] ?? `chain ${c.token.chainId}`}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : isEmpty ? (
        <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
          Empty for now. Send ETH, USDC, USDT, BNB, or SOL on Ethereum, Base, Arbitrum, BNB
          Chain, or Solana to your address above and it shows up here as one balance.
        </p>
      ) : null}
    </section>
  );
}
