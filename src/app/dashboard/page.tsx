"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMagic } from "@/providers/MagicProvider";
import { Header } from "@/components/Header";
import { SpritePageDecor } from "@/components/SpritePageDecor";
import { BalanceCard } from "@/components/BalanceCard";
import { RecentPayments } from "@/components/RecentPayments";
import { LoadingDog, Mascot } from "@/components/Mascot";
import { Treat } from "@/components/Treat";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { QrCode } from "@/components/QrCode";
import {
  StoredLink,
  buildStoredLink,
  deleteStoredLink,
  loadStoredLinks,
  saveStoredLink,
} from "@/lib/links";
import {
  CREATOR_EMOJIS,
  CreatorConfig,
  DOGI_AVATAR,
  TREAT_AVATAR,
  creatorPageCode,
  loadCreatorConfig,
  saveCreatorConfig,
} from "@/lib/creator";
import { formatUsd } from "@/lib/format";

export default function Dashboard() {
  const { address, initializing } = useMagic();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !address) router.replace("/");
  }, [initializing, address, router]);

  if (initializing || !address) {
    return (
      <div className="relative flex min-h-dvh flex-1 flex-col">
        <SpritePageDecor />
        <main className="relative z-10 flex flex-1 items-center justify-center">
          <LoadingDog label="Fetching your account…" size={112} />
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col">
      <SpritePageDecor />
      <div className="relative z-10 flex flex-1 flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
          <BalanceCard />
          <CoffeePageCard address={address} />
          <PaymentLinksSection address={address} />
          <RecentPayments address={address} />
          <p className="text-center text-xs text-muted">
            Your email login is your account. The same address works on Ethereum, Base,
            Arbitrum, BNB Chain, and Solana via Particle Universal Accounts (EIP-7702).
          </p>
        </main>
      </div>
    </div>
  );
}

function CoffeePageCard({ address }: { address: string }) {
  const [config, setConfig] = useState<{
    addr: string;
    value: CreatorConfig | null;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [emoji, setEmoji] = useState(CREATOR_EMOJIS[0]);
  const [price, setPrice] = useState("5");
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const saved =
    config && config.addr === address.toLowerCase()
      ? config.value
      : loadCreatorConfig(address);

  const pageUrl = useMemo(() => {
    if (!saved) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/tip/${creatorPageCode(address, saved)}`;
  }, [address, saved]);

  const startEditing = () => {
    if (saved) {
      setName(saved.name);
      setBio(saved.bio);
      setEmoji(saved.emoji || CREATOR_EMOJIS[0]);
      setPrice(String(saved.price));
    }
    setEditing(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const priceValue = Number(price);
    if (!trimmed) {
      setFormError("Add a name so fans know it's you");
      return;
    }
    if (trimmed.length > 40) {
      setFormError("Keep the name under 40 characters");
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue < 0.5 || priceValue > 1000) {
      setFormError("Treat price must be between $0.50 and $1,000");
      return;
    }
    setFormError(null);
    const next: CreatorConfig = {
      name: trimmed,
      bio: bio.trim().slice(0, 160),
      emoji,
      price: priceValue,
    };
    saveCreatorConfig(address, next);
    setConfig({ addr: address.toLowerCase(), value: next });
    setEditing(false);
  };

  const copyPageUrl = async () => {
    if (!pageUrl) return;
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="rounded-3xl border border-border bg-accent/20 p-6 fade-in-up sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <CreatorAvatar emoji={saved?.emoji ?? DOGI_AVATAR} size={48} className="pop-in" />
          <h2 className="mt-2 text-xl font-bold tracking-tight">
            {saved ? "Your treat page" : "Start a treat page"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {saved
              ? "Share it anywhere. Fans send you treats with any token on any chain. You get USDC on Arbitrum."
              : "Give your audience an easy way to say thanks. Fans pay with any token on any chain, no wallet needed. You get USDC on Arbitrum."}
          </p>
        </div>

        {!editing && saved && pageUrl ? (
          <div className="w-full rounded-2xl border border-border bg-surface p-4 sm:max-w-xs">
            <div className="flex items-center gap-3">
              <CreatorAvatar emoji={saved.emoji} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{saved.name}</p>
                <p className="text-xs text-muted">
                  {formatUsd(saved.price)} per treat
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={copyPageUrl}
                className="h-10 flex-1 rounded-full bg-accent text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copied ? "Copied!" : "Copy page link"}
              </button>
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center rounded-full border border-border-strong px-4 text-xs font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Preview
              </a>
              <button
                type="button"
                onClick={() => setShowQr((v) => !v)}
                aria-pressed={showQr}
                className="flex h-10 items-center rounded-full border border-border-strong px-3 text-xs font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                QR
              </button>
              <button
                type="button"
                onClick={startEditing}
                className="flex h-10 items-center rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Edit
              </button>
            </div>
            {showQr ? (
              <div className="mt-4 flex justify-center border-t border-border pt-4">
                <QrCode value={pageUrl} label="Scan to open your treat page" />
              </div>
            ) : null}
          </div>
        ) : null}

        {!editing && !saved ? (
          <button
            type="button"
            onClick={startEditing}
            className="h-11 shrink-0 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create my page
          </button>
        ) : null}
      </div>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="mt-6 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="creator-name" className="text-sm font-semibold">
              Name
            </label>
            <input
              id="creator-name"
              type="text"
              maxLength={40}
              placeholder="Allen"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError) setFormError(null);
              }}
              className="h-11 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="creator-price" className="text-sm font-semibold">
              Price per treat (USD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                $
              </span>
              <input
                id="creator-price"
                type="number"
                inputMode="decimal"
                min="0.5"
                max="1000"
                step="0.5"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="h-11 w-full rounded-full border border-border bg-surface pl-8 pr-4 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="creator-bio" className="text-sm font-semibold">
              Bio <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="creator-bio"
              type="text"
              maxLength={160}
              placeholder="Making videos about indie music"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="h-11 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Avatar</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CREATOR_EMOJIS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  aria-label={
                    option === DOGI_AVATAR
                      ? "Avatar Dogi mascot"
                      : option === TREAT_AVATAR
                        ? "Avatar treat"
                        : `Avatar ${option}`
                  }
                  aria-pressed={emoji === option}
                  className={`flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    emoji === option
                      ? "border-foreground bg-accent"
                      : "border-border bg-surface hover:bg-surface-raised"
                  }`}
                >
                  {option === DOGI_AVATAR ? (
                    <Mascot size={28} />
                  ) : option === TREAT_AVATAR ? (
                    <Treat size={24} />
                  ) : (
                    <span className="text-xl">{option}</span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          {formError ? (
            <p className="text-sm text-danger sm:col-span-2">{formError}</p>
          ) : null}
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              className="h-11 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {saved ? "Save changes" : "Create my page"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormError(null);
              }}
              className="h-11 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function PaymentLinksSection({ address }: { address: string }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [linksOverride, setLinksOverride] = useState<{
    addr: string;
    list: StoredLink[];
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Derived from localStorage; local mutations override until the address changes.
  const links = useMemo(() => {
    if (linksOverride && linksOverride.addr === address.toLowerCase()) {
      return linksOverride.list;
    }
    return loadStoredLinks(address);
  }, [address, linksOverride]);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  const createLink = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Enter an amount greater than 0");
      return;
    }
    if (value > 100000) {
      setFormError("Keep it under $100,000");
      return;
    }
    setFormError(null);
    const link = buildStoredLink(address, value.toFixed(2), note.trim() || undefined);
    saveStoredLink(address, link);
    setLinksOverride({ addr: address.toLowerCase(), list: [link, ...links] });
    setAmount("");
    setNote("");
    copyLink(link.code);
  };

  const copyLink = async (code: string) => {
    await navigator.clipboard.writeText(`${origin}/pay/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const removeLink = (code: string) => {
    deleteStoredLink(address, code);
    setLinksOverride({
      addr: address.toLowerCase(),
      list: links.filter((l) => l.code !== code),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-border bg-surface p-6 fade-in-up">
        <h2 className="text-xl font-bold tracking-tight">Create a payment link</h2>
        <p className="mt-1 text-sm text-muted">
          For invoices and one-off payments. You&apos;ll receive USDC on Arbitrum,
          whatever your payer holds.
        </p>
        <form onSubmit={createLink} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-semibold">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="25.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="h-11 w-full rounded-full border border-border bg-surface pl-8 pr-4 text-sm tabular-nums placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-sm font-semibold">
              Note <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="note"
              type="text"
              maxLength={120}
              placeholder="Invoice #42, dinner, treats…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-11 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <button
            type="submit"
            className="h-11 rounded-full bg-foreground text-sm font-bold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Create &amp; copy link
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 fade-in-up-delayed">
        <h2 className="text-xl font-bold tracking-tight">Your links</h2>
        {links.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">
            No links yet. Create one on the left and share it anywhere.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.code} className="rounded-2xl bg-surface-raised p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold tabular-nums">
                      {formatUsd(link.amount)}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {link.note || new Date(link.ts).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={`/pay/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-2.5 py-2 text-xs font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setQrCode((current) => (current === link.code ? null : link.code))
                      }
                      aria-pressed={qrCode === link.code}
                      className="rounded-full border border-border-strong px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      QR
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(link.code)}
                      className="rounded-full border border-border-strong px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {copiedCode === link.code ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(link.code)}
                      aria-label="Delete link"
                      className="rounded-full px-2.5 py-2 text-xs text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {qrCode === link.code ? (
                  <div className="mt-3 flex justify-center border-t border-border pt-3">
                    <QrCode
                      value={`${origin}/pay/${link.code}`}
                      label={`Scan to pay ${formatUsd(link.amount)}`}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
