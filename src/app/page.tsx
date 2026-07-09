"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMagic } from "@/providers/MagicProvider";
import { EmailLogin } from "@/components/EmailLogin";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { LoadingDog, Logo } from "@/components/Mascot";
import { Treat } from "@/components/Treat";
import { SpriteIcon } from "@/components/Sprite";
import { ActivityCard, type ActivityCardData } from "@/components/ActivityCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { LandingDecor } from "@/components/LandingDecor";
import { formatUsd } from "@/lib/format";

type SideCard = ActivityCardData & { className: string };

const HERO_SIDE: SideCard[] = [
  {
    variant: "supporter",
    name: "Sofia · new supporter",
    detail: "paid with SOL, from Solana",
    message: "sent Allen 3 treats",
    amount: 15,
    rotate: -6,
    float: "slow",
    className: "absolute left-2 top-24 xl:left-6",
  },
  {
    variant: "invoice",
    label: "Invoice #42",
    amount: 25,
    rotate: 6,
    float: "slower",
    className: "absolute right-2 top-52 xl:right-6",
  },
];

const LOGIN_SIDE: SideCard[] = [
  {
    variant: "supporter",
    name: "Marcus · just paid",
    detail: "paid with USDC, from Ethereum",
    message: "sent 2 treats",
    amount: 10,
    rotate: -4,
    float: "slow",
    className: "absolute left-0 top-12 xl:left-8",
  },
  {
    variant: "invoice",
    label: "Invoice #91",
    amount: 340,
    subtitle: "settled as USDC on Arbitrum",
    rotate: 5,
    float: "slower",
    className: "absolute right-0 top-20 xl:right-8",
  },
];

function SideCards({
  cards,
  side,
}: {
  cards: SideCard[];
  side: "left" | "right";
}) {
  const filtered = cards.filter((c) =>
    side === "left" ? c.className.includes("left-") : c.className.includes("right-"),
  );

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      {filtered.map((card, i) => (
        <div key={`${card.variant}-${i}`} className={card.className}>
          <ScrollReveal direction={side} delayMs={i * 140}>
            <ActivityCard data={card} />
          </ScrollReveal>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { address, initializing } = useMagic();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && address) router.replace("/dashboard");
  }, [initializing, address, router]);

  return (
    <main className="flex flex-col overflow-x-clip">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size={40} className="text-lg" />
        <a
          href="#login"
          className="flex h-10 items-center rounded-full bg-accent px-5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Log in
        </a>
      </header>

      {/* Hero */}
      <section className="relative w-full overflow-hidden pb-16 pt-14 sm:pt-20">
        <LandingDecor variant="hero" />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SideCards cards={HERO_SIDE} side="left" />
          <SideCards cards={HERO_SIDE} side="right" />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="hero-stagger hero-stagger-1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-muted">
            <SpriteIcon name="techBadge" size={28} />
            Universal Accounts · EIP-7702 · Magic · Arbitrum
          </p>
          <h1 className="hero-stagger hero-stagger-2 mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            Get paid from{" "}
            <span className="whitespace-nowrap rounded-2xl bg-accent px-2 sm:px-3">
              any chain
            </span>
          </h1>
          <p className="hero-stagger hero-stagger-3 mt-6 max-w-xl text-lg text-muted">
            A treat page for your fans and payment links for everything else. People
            pay with whatever they hold, on any chain. You always receive USDC on
            Arbitrum. They just log in with email.
          </p>
          <div className="hero-stagger hero-stagger-4 mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#login"
              className="flex h-13 items-center rounded-full bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-lg shadow-accent/40 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start my page. It&apos;s free.
            </a>
            <a
              href="#products"
              className="flex h-13 items-center rounded-full px-6 py-4 text-base font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See how it works ↓
            </a>
          </div>
          <p className="hero-stagger hero-stagger-5 mt-6 text-xs text-muted">
            No wallet app. No seed phrases. No gas. One balance across Ethereum, Base,
            Arbitrum, BNB Chain, and Solana.
          </p>
        </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative w-full overflow-hidden bg-surface py-16 sm:py-24">
        <LandingDecor variant="products" />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="relative z-10">
            <ScrollReveal>
              <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
                Two products. One account.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-muted">
                Everything lands in the same balance, spendable on any chain.
              </p>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <ScrollReveal direction="left" delayMs={80}>
                <div className="rounded-3xl border border-border bg-background p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold">
                    <Treat size={16} />
                    Treat page
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">
                    Give fans an easy way to say thanks.
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    A simple treat page with your name, avatar, and price. Fans pick 1,
                    3, or 5 treats, leave a note, and pay in one tap from any chain, with
                    any token.
                  </p>
                  <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-border/40">
                    <div className="flex items-center gap-3">
                      <CreatorAvatar emoji="dogi" size={48} />
                      <div>
                        <p className="text-sm font-bold">Allen</p>
                        <p className="text-xs text-muted">Making videos about indie music</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent bg-accent/15 p-3">
                      <Treat size={24} />
                      <span className="text-xs text-muted" aria-hidden="true">×</span>
                      {[1, 3, 5].map((n, i) => (
                        <span
                          key={n}
                          className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                            i === 1
                              ? "bg-foreground text-background"
                              : "border border-border-strong bg-surface"
                          }`}
                          aria-hidden="true"
                        >
                          {n}
                        </span>
                      ))}
                      <span className="ml-auto rounded-full bg-accent px-4 py-2 text-xs font-bold">
                        Support {formatUsd(15)}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delayMs={160}>
                <div className="rounded-3xl border border-border bg-background p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
                      <path
                        d="M10 14a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11 5.9M14 10a5 5 0 00-7.07 0l-2.83 2.83a5 5 0 007.07 7.07L13 18.1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Payment links
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">
                    Invoice anyone, anywhere.
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Set an amount and a note, share the link. Your client logs in with
                    email and pays with whatever they hold. You get USDC on Arbitrum,
                    every time.
                  </p>
                  <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-border/40">
                    <p className="text-center text-xs text-muted">Payment request</p>
                    <p className="mt-1 text-center text-3xl font-extrabold tabular-nums">
                      {formatUsd(25)}
                    </p>
                    <p className="mt-1 text-center text-xs text-muted">
                      &ldquo;Invoice #42, design work&rdquo;
                    </p>
                    <span className="mx-auto mt-4 flex h-10 w-full max-w-55 items-center justify-center rounded-full bg-accent text-xs font-bold">
                      Pay {formatUsd(25)}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                {
                  sprite: "stepLogin" as const,
                  title: "Log in with email",
                  body: "A one-time code creates your account. No wallet app, no seed phrase, nothing to install.",
                },
                {
                  sprite: "stepShare" as const,
                  title: "Share your link",
                  body: "Your treat page or a payment link. Send it to fans, clients, friends, anyone.",
                },
                {
                  sprite: "stepPay" as const,
                  title: "Get USDC on Arbitrum",
                  body: "Payers use any token on any chain. Routing, bridging, and gas are handled automatically.",
                },
              ].map((step, i) => (
                <ScrollReveal key={step.title} delayMs={i * 100}>
                  <div className="text-center">
                    <span
                      className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/25"
                      aria-hidden="true"
                    >
                      <SpriteIcon name={step.sprite} size={44} />
                    </span>
                    <p className="mt-4 text-xs font-bold text-muted">STEP {i + 1}</p>
                    <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted">{step.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Login */}
      <section
        id="login"
        className="relative w-full overflow-hidden scroll-mt-8 py-10 sm:py-14"
      >
        <LandingDecor variant="login" />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SideCards cards={LOGIN_SIDE} side="left" />
        <SideCards cards={LOGIN_SIDE} side="right" />

        <ScrollReveal className="relative z-10 mx-auto w-full max-w-sm">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xl shadow-border/60 sm:p-8">
            <h2 className="text-xl font-bold">Start in 30 seconds</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Log in or create an account with your email. Free, no seed phrases.
            </p>
            {initializing ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingDog label="Waking up Dogi…" />
              </div>
            ) : (
              <EmailLogin onSuccess={() => router.replace("/dashboard")} />
            )}
          </div>
        </ScrollReveal>
        </div>
      </section>

      <footer className="relative border-t border-border">
        <div className="absolute inset-0 landing-footer-dots" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
          <Logo size={32} className="text-xs" />
          <p>Powered by Particle Universal Accounts (EIP-7702) · Magic · Arbitrum</p>
        </div>
      </footer>
    </main>
  );
}
