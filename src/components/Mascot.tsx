import Image from "next/image";

/** The Dogi mascot: a pixel-art dog that walks (animated GIF, 4:3 ratio). */
export function Mascot({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/mascot.gif"
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round(size * 0.75)}
      unoptimized
      className={className}
      priority={size >= 64}
    />
  );
}

/** Compact inline loader: walking dog for buttons and tight spaces. */
export function InlineDog({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <Mascot size={size} className={className} />;
}

/** Full loading state: the dog walks while things load. */
export function LoadingDog({
  label = "Fetching…",
  size = 96,
}: {
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4" role="status">
      <Mascot size={size} />
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}

/** Dogi wordmark: mascot + name, used in nav and page shells. */
export function Logo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight ${className}`}>
      <Mascot size={size} />
      Dogi
    </span>
  );
}
