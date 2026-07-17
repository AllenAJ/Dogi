"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchReceivedPayments, timeAgo, type ReceivedPayment } from "@/lib/payments";
import { IS_DEMO, demoDelay, demoReceivedPayments } from "@/lib/demo";
import { formatUsd, shortAddress } from "@/lib/format";
import { settlementExplorerTxUrl, SETTLEMENT_CHAIN_LABEL } from "@/lib/config";
import { InlineDog } from "./Mascot";
import { Treat } from "./Treat";

type FeedState =
  | { status: "loading" }
  | { status: "ready"; payments: ReceivedPayment[] }
  | { status: "error" };

/** Incoming USDC on the settlement chain: the creator's "who paid me" feed. */
export function RecentPayments({ address }: { address: string }) {
  const [state, setState] = useState<FeedState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      if (IS_DEMO) {
        await demoDelay(700);
        setState({ status: "ready", payments: demoReceivedPayments() });
        return;
      }
      const payments = await fetchReceivedPayments(address);
      setState({ status: "ready", payments });
    } catch (err) {
      console.error("Failed to fetch received payments:", err);
      setState({ status: "error" });
    }
  }, [address]);

  // Deferred so the state updates happen outside the effect's synchronous body.
  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Payments received</h2>
          <p className="mt-1 text-sm text-muted">
            USDC landing on {SETTLEMENT_CHAIN_LABEL}, straight from your fans and clients.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={state.status === "loading"}
          aria-label="Refresh payments"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {state.status === "loading" ? (
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

      {state.status === "loading" ? (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted">
          <InlineDog size={24} /> Checking the chain…
        </div>
      ) : state.status === "error" ? (
        <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
          Couldn&apos;t reach the network just now. Try refreshing in a moment.
        </p>
      ) : state.payments.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">
          Nothing yet. Share your treat page or a payment link. Every payment lands
          here as USDC on {SETTLEMENT_CHAIN_LABEL}.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          {state.payments.map((payment) => (
            <li
              key={payment.txHash}
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface-raised p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/25"
                  aria-hidden="true"
                >
                  <Treat size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold tabular-nums">
                    +{formatUsd(payment.amount)}{" "}
                    <span className="font-normal text-muted">USDC</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    from <span className="font-mono">{shortAddress(payment.from)}</span>
                    {payment.timestamp ? ` · ${timeAgo(payment.timestamp)}` : ""}
                  </p>
                </div>
              </div>
              {!IS_DEMO ? (
                <a
                  href={settlementExplorerTxUrl(payment.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full border border-border-strong px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
