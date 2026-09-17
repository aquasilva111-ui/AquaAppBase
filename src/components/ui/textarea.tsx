import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl bg-white/40 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-white/70 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
