import { Mascot } from "./Mascot";

export const DOGI_AVATAR = "dogi";

export function CreatorAvatar({
  emoji,
  size = 80,
  className = "",
}: {
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const useMascot = !emoji || emoji === DOGI_AVATAR;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent shadow-[0_6px_0_0] shadow-border-strong ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={useMascot ? true : undefined}
    >
      {useMascot ? (
        <Mascot size={Math.round(size * 0.72)} />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.45) }}>{emoji}</span>
      )}
    </span>
  );
}
