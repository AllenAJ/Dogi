import Image from "next/image";

/** Dog treat icon used instead of coffee cup imagery. */
export function Treat({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/treat.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}
