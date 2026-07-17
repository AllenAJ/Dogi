"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmailLogin } from "@/components/EmailLogin";
import { InlineDog, LoadingDog, Logo } from "@/components/Mascot";
import { QrCode } from "@/components/QrCode";
import { useMagic } from "@/providers/MagicProvider";
import { shortAddress } from "@/lib/format";
import { SETTLEMENT_CHAIN_LABEL } from "@/lib/config";

const SUPPORTED_CHAINS = ["Ethereum", "Base", "Arbitrum", "BNB Chain", "Solana"];
const SUPPORTED_TOKENS = ["ETH", "USDC", "USDT", "BNB", "SOL"];

// useSearchParams() requires a Suspense boundary for prerendering.
export default function FundPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
          <LoadingDog label="Waking up Dogi..." size={70} />
        </main>
      }
    >
      <FundPageInner />
    </Suspense>
  );
}

function FundPageInner() {
  const { address, initializing } = useMagic();
  const [copied, setCopied] = useState(false);
  const params = useSearchParams();

  const nextPath = useMemo(() => {
    const raw = params.get("next");
    if (!raw || !raw.startsWith("/")) return "/dashboard";
    return raw;
  }, [params]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="flex min-h-[calc(100dvh-64px)] flex-col items-center px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="mb-7 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Logo size={40} className="text-lg" />
      </Link>

      <section className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-border/60 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Add funds</h1>
        <p className="mt-2 text-sm text-muted">
          Top up once, then Dogi can pay invoices or treat links from your unified balance.
        </p>
        <p className="mt-1 text-xs text-muted">
          Settlement network: {SETTLEMENT_CHAIN_LABEL}
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-background p-5">
          {initializing ? (
            <div className="flex h-24 items-center justify-center">
              <LoadingDog label="Waking up Dogi..." size={70} />
            </div>
          ) : !address ? (
            <>
              <p className="mb-4 text-sm text-muted">
                Log in with your email first. We will give you a deposit address right after.
              </p>
              <EmailLogin />
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Your deposit address
                </p>
                <p className="mt-2 break-all font-mono text-sm">{address}</p>
                <div className="mt-3 flex justify-center">
                  <QrCode value={address} size={144} label="Scan to copy your address" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="rounded-full border border-border-strong px-4 py-2 text-xs font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copied ? "Copied" : "Copy address"}
                  </button>
                  <span className="text-xs text-muted">{shortAddress(address, 6)}</span>
                </div>
              </div>

              <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Supported chains</p>
                  <p className="mt-1">{SUPPORTED_CHAINS.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Common assets</p>
                  <p className="mt-1">{SUPPORTED_TOKENS.join(", ")}</p>
                </div>
              </div>

              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
                <li>Send funds to this address from any exchange or wallet you use.</li>
                <li>Wait for confirmations. Then refresh your pay page.</li>
                <li>Complete the payment in one tap.</li>
              </ol>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Link
                  href={nextPath}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Back to payment
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted">
        Funds across chains appear as one balance inside Dogi.
      </p>
      <div className="mt-2">
        <InlineDog size={24} />
      </div>
    </main>
  );
}
