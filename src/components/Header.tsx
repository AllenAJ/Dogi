"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMagic } from "@/providers/MagicProvider";
import { shortAddress } from "@/lib/format";
import { Logo } from "@/components/Mascot";
import { useState } from "react";

export function Header() {
  const { address, logout } = useMagic();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo size={40} />
        </Link>

        {address ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAddress}
              className="rounded-full border border-border-strong bg-surface px-3 py-2 font-mono text-xs text-muted transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Copy address"
            >
              {copied ? "Copied" : shortAddress(address)}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="rounded-full px-3 py-2 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
