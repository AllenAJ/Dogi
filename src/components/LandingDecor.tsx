type Variant = "hero" | "products" | "login";

export function LandingDecor({ variant }: { variant: Variant }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 landing-dots ${
          variant === "products" ? "landing-dots-on-surface" : ""
        }`}
      />
      <div
        className={`absolute inset-0 landing-dots-accent ${
          variant === "products" ? "landing-dots-accent-on-surface" : ""
        }`}
      />
      {variant !== "products" && <div className="absolute inset-0 landing-dots-vignette" />}

      {variant === "hero" && (
        <>
          <div className="absolute -right-24 top-0 size-[32rem] rounded-full bg-accent/22 blur-3xl" />
          <div className="absolute -left-20 bottom-[-4rem] size-80 rounded-full bg-accent/14 blur-3xl" />
          <div className="absolute left-[12%] top-[18%] size-3 rounded-full bg-accent/50" />
          <div className="absolute right-[14%] top-[62%] size-2 rounded-full bg-border-strong/80" />
          <div className="absolute left-[8%] bottom-[22%] size-2 rounded-full bg-border-strong/60" />
        </>
      )}

      {variant === "products" && (
        <>
          <div className="absolute inset-0 landing-grid" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border-strong/70 to-transparent" />
          <div className="absolute -left-28 top-1/4 size-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -right-24 bottom-1/3 size-80 rounded-full bg-accent/12 blur-3xl" />
        </>
      )}

      {variant === "login" && (
        <>
          <div className="absolute -left-28 top-6 size-80 rounded-full bg-accent/18 blur-3xl" />
          <div className="absolute -right-24 bottom-8 size-72 rounded-full bg-accent/14 blur-3xl" />
          <div className="absolute right-[10%] top-[14%] size-2.5 rounded-full bg-accent/45" />
          <div className="absolute left-[9%] bottom-[18%] size-2 rounded-full bg-border-strong/70" />
        </>
      )}
    </div>
  );
}
