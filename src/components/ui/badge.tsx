import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "foam",
  children,
}: {
  className?: string;
  tone?: "foam" | "primary" | "warn" | "ok" | "quiet";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "foam" && "bg-foam text-deep",
        tone === "primary" && "bg-primary/12 text-deep",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "ok" && "bg-ok/12 text-ok",
        tone === "quiet" && "bg-white/50 text-muted-foreground ring-1 ring-white/70",
        className,
      )}
    >
      {children}
    </span>
  );
}
