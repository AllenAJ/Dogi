import { IS_DEMO } from "@/lib/demo";

/** Fixed badge shown whenever NEXT_PUBLIC_DEMO_MODE=1, so recordings are honest. */
export function DemoBadge() {
  if (!IS_DEMO) return null;
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-50 rounded-full border border-border-strong bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted shadow-lg">
      Simulated demo · balances aren&apos;t real
    </div>
  );
}
