"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useMagic } from "@/providers/MagicProvider";
import { useUniversalAccount } from "@/providers/UniversalAccountProvider";
import { EmailLogin } from "@/components/EmailLogin";
import { InlineDog, LoadingDog, Logo, Mascot } from "@/components/Mascot";
import { RouteCard } from "@/components/RouteCard";
import { decodePaymentLink } from "@/lib/links";
import { formatUsd, shortAddress } from "@/lib/format";
import { balanceDisplay, hasLowUsdBalance } from "@/lib/balanceDisplay";
import type { RouteSummary } from "@/lib/route";
import {
  explorerTxUrl,
  SETTLEMENT_CHAIN_LABEL,
} from "@/lib/config";

type PayState =
  | { step: "idle" }
  | { step: "quoting" }
  | { step: "preview"; route: RouteSummary }
  | { step: "paying"; label: string }
  | { step: "done"; transactionId: string; route: RouteSummary | null }
  | { step: "error"; message: string };

export default function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const payload = useMemo(() => decodePaymentLink(code), [code]);

  const { address, initializing } = useMagic();
  const {
    primaryAssets,
    onChainNativeEth,
    balanceLoading,
    previewPayUsdcOnArbitrum,
    payUsdcOnArbitrum,
    refreshBalance,
  } = useUniversalAccount();
  const [state, setState] = useState<PayState>({ step: "idle" });

  if (!payload) {
    return (
      <Shell>
        <div className="text-center">
          <Mascot size={72} className="mx-auto" />
          <h1 className="mt-4 text-xl font-semibold">This link isn&apos;t valid</h1>
          <p className="mt-2 text-sm text-muted">
            It may be incomplete or corrupted. Ask the sender for a new one.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to Dogi
          </Link>
        </div>
      </Shell>
    );
  }

  const amountNumber = Number(payload.amount);
  const insufficient = hasLowUsdBalance(primaryAssets, amountNumber);
  const busy = state.step === "paying" || state.step === "quoting";
  const balance = balanceDisplay({
    primaryAssets,
    onChainNativeEth,
    settlementLabel: SETTLEMENT_CHAIN_LABEL,
  });

  const handlePay = async () => {
    setState({ step: "paying", label: "Sending across chains…" });
    try {
      const { transactionId, route } = await payUsdcOnArbitrum(payload.to, payload.amount);
      setState({ step: "done", transactionId, route });
      refreshBalance();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Payment failed. Nothing was charged. Try again.";
      setState({ step: "error", message });
    }
  };

  const handleQuote = async () => {
    setState({ step: "quoting" });
    try {
      const route = await previewPayUsdcOnArbitrum(payload.to, payload.amount);
      if (route) {
        setState({ step: "preview", route });
      } else {
        // No parseable route (e.g. testnet) — pay directly like before.
        await handlePay();
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Couldn't build a route for this payment. Try again.";
      setState({ step: "error", message });
    }
  };

  return (
    <Shell>
      {/* Payment request card */}
      <div className="w-full">
        <p className="text-center text-sm text-muted">Payment request</p>
        <p className="mt-2 text-center text-5xl font-semibold tabular-nums tracking-tight">
          {formatUsd(payload.amount)}
        </p>
        {payload.note ? (
          <p className="mt-3 text-center text-sm text-muted">“{payload.note}”</p>
        ) : null}
        <p className="mt-3 text-center font-mono text-xs text-muted">
          to {shortAddress(payload.to, 6)} · settles as USDC on {SETTLEMENT_CHAIN_LABEL}
        </p>

        <div className="mt-8 border-t border-border pt-6">
          {state.step === "done" ? (
            <div className="text-center">
              <Mascot size={96} className="mx-auto pop-in" />
              <h2 className="mt-4 text-lg font-semibold">Paid</h2>
              <p className="mt-1 text-sm text-muted">
                {formatUsd(payload.amount)} is on its way as USDC on {SETTLEMENT_CHAIN_LABEL}.
              </p>
              {state.route ? (
                <div className="mt-4">
                  <RouteCard route={state.route} amountUsd={amountNumber} compact />
                </div>
              ) : null}
              <a
                href={explorerTxUrl(state.transactionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View transaction ↗
              </a>
            </div>
          ) : initializing ? (
            <div className="flex h-24 items-center justify-center">
              <LoadingDog label="Waking up Dogi…" size={72} />
            </div>
          ) : !address ? (
            <>
              <p className="mb-4 text-center text-sm text-muted">
                Log in with your email to pay. No wallet or crypto knowledge needed.
              </p>
              <EmailLogin />
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-2xl bg-surface-raised px-4 py-3 text-sm">
                <span className="text-muted">Your balance (all chains)</span>
                <span className="text-right font-bold tabular-nums">
                  {balanceLoading && primaryAssets === null ? (
                    <InlineDog size={24} />
                  ) : (
                    <>
                      {balance.primary}
                      {balance.secondary ? (
                        <span className="block text-xs font-normal text-muted">
                          {balance.secondary}
                        </span>
                      ) : null}
                    </>
                  )}
                </span>
              </div>

              {insufficient ? (
                <div className="rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm">
                  <p className="font-semibold text-danger">Not enough funds yet</p>
                  <p className="mt-1 text-muted">
                    Send ETH, USDC, USDT, BNB, or SOL on Ethereum, Base, Arbitrum, BNB Chain,
                    or Solana to your address{" "}
                    <span className="font-mono">{shortAddress(address, 6)}</span> and it all
                    counts toward this payment.
                  </p>
                  <Link
                    href={`/fund?next=${encodeURIComponent(`/pay/${code}`)}`}
                    className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-border-strong bg-surface px-4 text-xs font-semibold text-foreground transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Add funds first
                  </Link>
                </div>
              ) : null}

              {state.step === "error" ? (
                <p className="rounded-2xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                  {state.message}
                </p>
              ) : null}

              {state.step === "preview" ? (
                <>
                  <RouteCard route={state.route} amountUsd={amountNumber} />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setState({ step: "idle" })}
                      className="flex h-12 items-center justify-center rounded-full border border-border-strong px-5 text-sm font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                      Confirm &amp; pay {formatUsd(payload.amount)}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleQuote}
                  disabled={busy || insufficient || primaryAssets === null}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {busy ? (
                    <>
                      <InlineDog size={28} />
                      {state.step === "paying"
                        ? state.label
                        : "Finding your best route…"}
                    </>
                  ) : (
                    `Pay ${formatUsd(payload.amount)}`
                  )}
                </button>
              )}
              <p className="text-center text-xs text-muted">
                Pays from whatever you hold, on any chain. You&apos;ll see the exact route
                and fees before anything is sent.
              </p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Logo size={40} className="text-lg" />
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-border/60 fade-in-up sm:p-8">
        {children}
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Powered by Particle Universal Accounts (EIP-7702) · Magic · Arbitrum
      </p>
    </main>
  );
}
