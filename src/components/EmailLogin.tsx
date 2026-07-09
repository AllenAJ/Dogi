"use client";

import { FormEvent, useState } from "react";
import { useMagic } from "@/providers/MagicProvider";
import { InlineDog } from "./Mascot";
import { hasRequiredEnv } from "@/lib/config";

export function EmailLogin({ onSuccess }: { onSuccess?: (address: string) => void }) {
  const { loginWithEmailOTP, magic } = useMagic();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const address = await loginWithEmailOTP(email);
      onSuccess?.(address);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!hasRequiredEnv) {
    return (
      <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
        Missing API keys. Copy <code className="font-mono">.env.example</code> to{" "}
        <code className="font-mono">.env.local</code> and add your Magic and Particle
        credentials, then restart the dev server.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <label htmlFor="login-email" className="text-sm font-medium">
        Email
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        className="h-11 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        disabled={busy}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !magic}
        className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {busy ? (
          <>
            <InlineDog size={28} /> Check your inbox…
          </>
        ) : (
          "Continue with email"
        )}
      </button>
      <p className="text-center text-xs text-muted">
        No wallet, no seed phrase. A one-time code creates your account.
      </p>
    </form>
  );
}
