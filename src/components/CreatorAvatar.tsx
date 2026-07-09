import { Mascot } from "./Mascot";
import { Treat } from "./Treat";

export const DOGI_AVATAR = "dogi";
export const TREAT_AVATAR = "treat";

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
  const useTreat = emoji === TREAT_AVATAR || emoji === "☕";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent shadow-[0_6px_0_0] shadow-border-strong ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={useMascot || useTreat ? true : undefined}
    >
      {useMascot ? (
        <Mascot size={Math.round(size * 0.72)} />
      ) : useTreat ? (
        <Treat size={Math.round(size * 0.55)} />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.45) }}>{emoji}</span>
      )}
    </span>
  );
}
