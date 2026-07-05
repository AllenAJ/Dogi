"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useMagic } from "@/providers/MagicProvider";
import { useUniversalAccount } from "@/providers/UniversalAccountProvider";
import { EmailLogin } from "@/components/EmailLogin";
import { InlineDog, LoadingDog, Logo, Mascot } from "@/components/Mascot";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { decodeCreatorPage } from "@/lib/creator";
import { formatUsd, shortAddress } from "@/lib/format";
import { explorerTxUrl } from "@/lib/config";

const PRESET_COUNTS = [1, 3, 5];

type TipState =
  | { step: "idle" }
  | { step: "paying" }
  | { step: "done"; transactionId: string; count: number }
  | { step: "error"; message: string };

export default function TipPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const creator = useMemo(() => decodeCreatorPage(code), [code]);

  const { address, initializing } = useMagic();
  const { primaryAssets, balanceLoading, payUsdcOnArbitrum, refreshBalance } =
    useUniversalAccount();

  const [count, setCount] = useState(1);
  const [customCount, setCustomCount] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<TipState>({ step: "idle" });

  if (!creator) {
    return (
      <Shell>
        <div className="p-8 text-center sm:p-10">
          <Mascot size={80} className="mx-auto" />
          <h1 className="mt-3 text-xl font-bold">This page isn&apos;t valid</h1>
          <p className="mt-2 text-sm text-muted">
            The link may be incomplete or corrupted. Ask the creator for a fresh one.
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

  const effectiveCount = customCount ? Math.max(1, Math.floor(Number(customCount))) : count;
  const validCount = Number.isFinite(effectiveCount) && effectiveCount >= 1 && effectiveCount <= 1000;
  const total = validCount ? effectiveCount * creator.price : 0;
  const totalUsd = primaryAssets?.totalAmountInUSD ?? 0;
  const insufficient = primaryAssets !== null && validCount && totalUsd < total;
  const paying = state.step === "paying";

  const handleTip = async () => {
    if (!validCount) return;
    setState({ step: "paying" });
    try {
      const { transactionId } = await payUsdcOnArbitrum(creator.to, total.toFixed(2));
      setState({ step: "done", transactionId, count: effectiveCount });
      refreshBalance();
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Payment failed. Nothing was charged — try again.";
      setState({ step: "error", message: msg });
    }
  };

  return (
    <Shell>
      {/* Creator identity */}
      <div className="flex flex-col items-center border-b border-border px-6 pb-6 pt-10 text-center sm:px-10">
        <CreatorAvatar emoji={creator.emoji} size={80} className="pop-in" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{creator.name}</h1>
        {creator.bio ? <p className="mt-1 text-sm text-muted">{creator.bio}</p> : null}
      </div>

      <div className="p-6 sm:p-8">
        {state.step === "done" ? (
          <div className="text-center pop-in">
            <Mascot size={96} className="mx-auto" />
            <p className="text-3xl" aria-hidden="true">
              {"☕".repeat(Math.min(state.count, 5))}
            </p>
            <h2 className="mt-3 text-xl font-bold">
              You bought {creator.name} {state.count} coffee{state.count > 1 ? "s" : ""}!
            </h2>
            <p className="mt-1 text-sm text-muted">
              {formatUsd(state.count * creator.price)} is on its way as USDC on Arbitrum.
            </p>
            {message.trim() ? (
              <p className="mx-auto mt-4 max-w-xs rounded-2xl bg-surface-raised p-4 text-sm">
                “{message.trim()}”
              </p>
            ) : null}
            <div className="mt-6 flex flex-col items-center gap-3">
              <a
                href={explorerTxUrl(state.transactionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View transaction ↗
              </a>
              <Link
                href="/"
                className="text-xs text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start your own coffee page — it&apos;s free
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold">
              Buy {creator.name} a coffee{" "}
              <span aria-hidden="true">☕</span>
            </h2>

            {/* Coffee count selector */}
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-accent bg-accent/15 p-4">
              <span className="text-3xl" aria-hidden="true">
                ☕
              </span>
              <span className="text-muted" aria-hidden="true">
                ×
              </span>
              <div className="flex flex-1 items-center gap-2">
                {PRESET_COUNTS.map((preset) => {
                  const selected = !customCount && count === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setCount(preset);
                        setCustomCount("");
                      }}
                      aria-pressed={selected}
                      className={`flex size-11 items-center justify-center rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected
                          ? "bg-foreground text-background"
                          : "border border-border-strong bg-surface hover:bg-surface-raised"
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
                <label htmlFor="custom-count" className="sr-only">
                  Custom number of coffees
                </label>
                <input
                  id="custom-count"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="1000"
                  placeholder="10"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  className="h-11 w-16 rounded-full border border-border-strong bg-surface px-3 text-center text-sm font-bold tabular-nums placeholder:font-normal placeholder:text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="tip-message" className="text-sm font-semibold">
                Say something nice{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="tip-message"
                rows={2}
                maxLength={280}
                placeholder="Love what you're making!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none rounded-2xl border border-border bg-surface p-4 text-sm placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="mt-6 border-t border-border pt-6">
              {initializing ? (
                <div className="flex h-24 items-center justify-center">
                  <LoadingDog label="Waking up Dogi…" size={72} />
                </div>
              ) : !address ? (
                <>
                  <p className="mb-4 text-center text-sm text-muted">
                    Log in with your email to support {creator.name}. No wallet or
                    crypto knowledge needed.
                  </p>
                  <EmailLogin />
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-2xl bg-surface-raised px-4 py-3 text-sm">
                    <span className="text-muted">Your balance (all chains)</span>
                    <span className="font-bold tabular-nums">
                      {balanceLoading && primaryAssets === null ? (
                        <InlineDog size={24} />
                      ) : (
                        formatUsd(totalUsd)
                      )}
                    </span>
                  </div>

                  {insufficient ? (
                    <div className="rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm">
                      <p className="font-semibold text-danger">Not enough funds yet</p>
                      <p className="mt-1 text-muted">
                        Send any token — ETH, USDC, USDT, BNB, or SOL, on Ethereum,
                        Base, Arbitrum, BNB Chain, or Solana — to your address{" "}
                        <span className="font-mono">{shortAddress(address, 6)}</span>{" "}
                        and it all counts toward this tip.
                      </p>
                    </div>
                  ) : null}

                  {state.step === "error" ? (
                    <p className="rounded-2xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                      {state.message}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleTip}
                    disabled={paying || insufficient || !validCount || primaryAssets === null}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {paying ? (
                      <>
                        <InlineDog size={28} /> Brewing your cross-chain payment…
                      </>
                    ) : validCount ? (
                      `Support with ${formatUsd(total)}`
                    ) : (
                      "Pick how many coffees"
                    )}
                  </button>
                  <p className="text-center text-xs text-muted">
                    Pays from whatever you hold, on any chain. {creator.name} receives
                    USDC on Arbitrum.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
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
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-border/60 fade-in-up">
        {children}
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Powered by Particle Universal Accounts (EIP-7702) · Magic · Arbitrum
      </p>
    </main>
  );
}
