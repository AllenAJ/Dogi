import { CSSProperties } from "react";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { formatUsd } from "@/lib/format";

const tilt = (deg: number) => ({ "--tilt": `${deg}deg` }) as CSSProperties;

type SupporterCard = {
  variant: "supporter";
  name: string;
  detail: string;
  message: string;
  amount: number;
};

type InvoiceCard = {
  variant: "invoice";
  label: string;
  amount: number;
  paid?: boolean;
  subtitle?: string;
};

export type ActivityCardData = (SupporterCard | InvoiceCard) & {
  rotate?: number;
  float?: "slow" | "slower";
};

export function ActivityCard({ data }: { data: ActivityCardData }) {
  const rotate = data.rotate ?? 0;
  const floatClass =
    data.float === "slower" ? "float-slower" : data.float === "slow" ? "float-slow" : "";

  return (
    <div
      className={`w-56 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-border/60 ${floatClass}`}
      style={data.float ? tilt(rotate) : { transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {data.variant === "supporter" ? (
        <>
          <div className="flex items-center gap-2.5">
            <CreatorAvatar emoji="dogi" size={36} className="shadow-none" />
            <div>
              <p className="text-xs font-bold">{data.name}</p>
              <p className="text-[11px] text-muted">{data.detail}</p>
            </div>
          </div>
          <p className="mt-3 rounded-xl bg-surface-raised px-3 py-2 text-xs">
            {data.message} · <span className="font-bold">{formatUsd(data.amount)}</span>
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold">{data.label}</p>
            {data.paid !== false ? (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold">
                Paid ✓
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-border-strong px-2 py-0.5 text-[11px] font-semibold text-muted">
                Pending
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums">{formatUsd(data.amount)}</p>
          <p className="mt-1 text-[11px] text-muted">
            {data.subtitle ?? "settled as USDC on Arbitrum"}
          </p>
        </>
      )}
    </div>
  );
}
