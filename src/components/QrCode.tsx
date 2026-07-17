"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { InlineDog } from "./Mascot";

/** Renders `value` as a QR code image (generated client-side, no network). */
export function QrCode({
  value,
  size = 176,
  label,
}: {
  value: string;
  size?: number;
  label?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#0d0c22", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => console.error("QR generation failed:", err));
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL, no optimization needed
        <img
          src={dataUrl}
          alt={label ? `QR code: ${label}` : "QR code"}
          width={size}
          height={size}
          className="rounded-2xl border border-border bg-white p-2"
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-2xl border border-border bg-white"
          style={{ width: size, height: size }}
        >
          <InlineDog size={32} />
        </div>
      )}
      {label ? <p className="text-xs text-muted">{label}</p> : null}
    </div>
  );
}
