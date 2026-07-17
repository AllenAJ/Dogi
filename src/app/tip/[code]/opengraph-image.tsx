import { ImageResponse } from "next/og";
import { decodeCreatorPage, DOGI_AVATAR, TREAT_AVATAR } from "@/lib/creator";
import { formatUsd } from "@/lib/format";

export const alt = "Dogi treat page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0d0c22";
const CREAM = "#fdf7f0";
const YELLOW = "#ffdd00";
const MUTED = "#6b6880";

const avatarEmoji = (emoji?: string) =>
  !emoji || emoji === DOGI_AVATAR ? "🐶" : emoji === TREAT_AVATAR ? "🦴" : emoji;

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const creator = decodeCreatorPage(code);

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
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 999,
            background: YELLOW,
            fontSize: 90,
          }}
        >
          {avatarEmoji(creator?.emoji)}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -2,
            marginTop: 36,
          }}
        >
          {creator ? creator.name : "Dogi"}
        </div>
        {creator?.bio ? (
          <div
            style={{
              display: "flex",
              fontSize: 38,
              color: MUTED,
              marginTop: 8,
              maxWidth: 900,
            }}
          >
            {creator.bio.slice(0, 80)}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: YELLOW,
            borderRadius: 999,
            padding: "18px 44px",
            fontSize: 42,
            fontWeight: 800,
            marginTop: 48,
          }}
        >
          🦴 Send a treat{creator ? ` · ${formatUsd(creator.price)}` : ""}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: MUTED, marginTop: 40 }}>
          Pay with any token on any chain · just log in with email
        </div>
      </div>
    ),
    size,
  );
}
