/** Sprite sheet: 6 columns × 3 rows of Shiba faces (600×372). */
const COLS = 6;
const ROWS = 3;
const SHEET_W = 600;
const SHEET_H = 372;

export const SPRITES = {
  /** Cool sunglasses — tech stack badge */
  techBadge: { col: 3, row: 0 },
  /** Winking — friendly email login */
  stepLogin: { col: 2, row: 2 },
  /** Whistling — share your link */
  stepShare: { col: 2, row: 1 },
  /** Shouting with joy — get paid on Arbitrum */
  stepPay: { col: 5, row: 2 },
} as const;

type SpriteKey = keyof typeof SPRITES;

export function Sprite({
  col,
  row,
  size = 56,
  className = "",
}: {
  col: number;
  row: number;
  size?: number;
  className?: string;
}) {
  const cellW = SHEET_W / COLS;
  const cellH = SHEET_H / ROWS;
  const displayH = Math.round(size * (cellH / cellW));
  const scale = size / cellW;

  return (
    <span
      className={`inline-block shrink-0 bg-no-repeat ${className}`}
      style={{
        width: size,
        height: displayH,
        backgroundImage: "url(/sprites.jpg)",
        backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
        backgroundPosition: `${-col * cellW * scale}px ${-row * cellH * scale}px`,
      }}
      aria-hidden="true"
    />
  );
}

export function SpriteIcon({
  name,
  size = 56,
  className = "",
}: {
  name: SpriteKey;
  size?: number;
  className?: string;
}) {
  const { col, row } = SPRITES[name];
  return <Sprite col={col} row={row} size={size} className={className} />;
}
