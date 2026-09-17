import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border-0 bg-white/35 px-4 text-sm text-foreground shadow-none outline-none ring-1 ring-white/70 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
