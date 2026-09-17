import { cn } from "@/lib/utils";
import type { AvatarTone, Profile } from "@/lib/aqua/types";

const TONE: Record<AvatarTone, { a: string; b: string }> = {
  tide: { a: "#7ec8f5", b: "#0d2bdb" },
  foam: { a: "#eaf2ff", b: "#4ba3ff" },
  kelp: { a: "#7aa38a", b: "#1e4638" },
  ink: { a: "#8aa0b0", b: "#14202b" },
  pearl: { a: "#f3efe8", b: "#7a6a58" },
  deep: { a: "#0d2bdb", b: "#081820" },
};

export function NazarMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="32" r="30" fill="#0D2BDB" />
      <circle cx="32" cy="32" r="18.5" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="11.2" fill="#7EC8F5" />
      <circle cx="32" cy="32" r="5.1" fill="#111111" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      <NazarMark className="size-full" />
    </span>
  );
}

export function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <NazarMark className="size-9" title="AQUA" />
      {!compact && (
        <span className="text-lg font-semibold tracking-[0.14em] text-nazar">AQUA</span>
      )}
    </span>
  );
}

export function ProfileAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: Profile;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim = { sm: "size-8", md: "size-10", lg: "size-14", xl: "size-24" }[size];
  const colors = TONE[profile.tone];
  const initial = profile.name.slice(0, 1);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white",
        dim,
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`av-${profile.id}`} x1="0" y1="0" x2="40" y2="40">
            <stop stopColor={colors.a} />
            <stop offset="1" stopColor={colors.b} />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill={`url(#av-${profile.id})`} />
      </svg>
      <span
        className={cn(
          "relative font-medium text-primary-foreground",
          size === "xl" ? "text-3xl" : size === "lg" ? "text-xl" : "text-sm",
        )}
      >
        {initial}
      </span>
    </span>
  );
}
