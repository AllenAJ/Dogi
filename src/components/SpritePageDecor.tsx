import { Sprite } from "@/components/Sprite";

/** Dense Shiba sprite outlines for app page backgrounds. */
const DECOR_SPRITES = [
  { col: 0, row: 0, className: "left-[1%] top-[3%] -rotate-12", size: 40 },
  { col: 1, row: 0, className: "left-[14%] top-[1%] rotate-8", size: 36 },
  { col: 2, row: 0, className: "left-[28%] top-[5%] -rotate-6", size: 44 },
  { col: 3, row: 0, className: "right-[28%] top-[2%] rotate-10", size: 38 },
  { col: 4, row: 0, className: "right-[14%] top-[4%] -rotate-8", size: 42 },
  { col: 5, row: 0, className: "right-[1%] top-[2%] rotate-12", size: 40 },
  { col: 0, row: 1, className: "left-[0%] top-[22%] rotate-6", size: 48 },
  { col: 1, row: 1, className: "left-[8%] top-[32%] -rotate-10", size: 36 },
  { col: 2, row: 1, className: "left-[3%] top-[48%] rotate-12", size: 44 },
  { col: 3, row: 1, className: "right-[3%] top-[26%] -rotate-6", size: 40 },
  { col: 4, row: 1, className: "right-[9%] top-[40%] rotate-8", size: 46 },
  { col: 5, row: 1, className: "right-[0%] top-[52%] -rotate-12", size: 38 },
  { col: 0, row: 2, className: "left-[2%] bottom-[8%] -rotate-8", size: 42 },
  { col: 1, row: 2, className: "left-[16%] bottom-[4%] rotate-10", size: 36 },
  { col: 2, row: 2, className: "left-[6%] bottom-[22%] -rotate-6", size: 40 },
  { col: 3, row: 2, className: "right-[6%] bottom-[20%] rotate-12", size: 44 },
  { col: 4, row: 2, className: "right-[15%] bottom-[6%] -rotate-10", size: 38 },
  { col: 5, row: 2, className: "right-[2%] bottom-[10%] rotate-6", size: 42 },
  { col: 0, row: 0, className: "left-[22%] bottom-[12%] rotate-3", size: 34 },
  { col: 2, row: 2, className: "right-[22%] bottom-[14%] -rotate-3", size: 34 },
  { col: 4, row: 0, className: "left-[38%] top-[12%] -rotate-12", size: 32 },
  { col: 1, row: 2, className: "right-[38%] top-[14%] rotate-12", size: 32 },
  { col: 5, row: 2, className: "left-[42%] bottom-[2%] rotate-8", size: 30 },
  { col: 3, row: 0, className: "right-[42%] bottom-[4%] -rotate-8", size: 30 },
] as const;

const ENTER_MS = 55;
const STAGGER_MS = 42;

function decorSide(className: string): "left" | "right" {
  return className.includes("left-") ? "left" : "right";
}

export function SpritePageDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 landing-dots opacity-35" />
      <div className="absolute inset-0 landing-dots-accent opacity-20" />
      <div className="sprite-decor-bg absolute -right-20 top-0 size-72 rounded-full bg-accent/14 blur-3xl" />
      <div
        className="sprite-decor-bg absolute -left-16 bottom-0 size-64 rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "120ms" }}
      />

      {DECOR_SPRITES.map((item, i) => {
        const side = decorSide(item.className);
        const enterDelay = i * STAGGER_MS;
        const floatDelay = enterDelay + ENTER_MS;

        return (
          <div
            key={`${item.col}-${item.row}-${i}`}
            className={`absolute opacity-[0.2] ${
              side === "left" ? "sprite-decor-enter-left" : "sprite-decor-enter-right"
            } ${item.className}`}
            style={
              {
                "--enter-delay": `${enterDelay}ms`,
                "--float-delay": `${floatDelay}ms`,
              } as React.CSSProperties
            }
          >
            <div className={i % 2 === 0 ? "sprite-decor-drift-a" : "sprite-decor-drift-b"}>
              <div className="rounded-2xl border border-dashed border-border-strong/40 bg-surface/25 p-1">
                <Sprite col={item.col} row={item.row} size={item.size} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
