import { InlineDog } from "./Mascot";

/** @deprecated Use InlineDog or LoadingDog — kept so existing imports show the walking dog. */
export function Spinner({ className = "" }: { className?: string }) {
  return <InlineDog size={24} className={className} />;
}
