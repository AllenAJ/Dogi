import { ImageResponse } from "next/og";
import { decodePaymentLink } from "@/lib/links";
import { formatUsd } from "@/lib/format";

export const alt = "Dogi payment request";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0d0c22";
const CREAM = "#fdf7f0";
const YELLOW = "#ffdd00";
const MUTED = "#6b6880";

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const payload = decodePaymentLink(code);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: YELLOW,
            borderRadius: 999,
            padding: "14px 36px",
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          🐶 Dogi
        </div>
        <div style={{ display: "flex", fontSize: 40, color: MUTED, marginTop: 48 }}>
          Payment request
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: -4,
            marginTop: 8,
          }}
        >
          {payload ? formatUsd(payload.amount) : "Pay with Dogi"}
        </div>
        {payload?.note ? (
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: MUTED,
              marginTop: 8,
              maxWidth: 900,
            }}
          >
            “{payload.note.slice(0, 60)}”
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: MUTED,
            marginTop: 64,
          }}
        >
          Pay with any token on any chain · just log in with email
        </div>
      </div>
    ),
    size,
  );
}
