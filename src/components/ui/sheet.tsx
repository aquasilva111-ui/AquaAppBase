import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer.Root>
  );
}

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Drawer.Content>
>(({ className, children, ...props }, ref) => (
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-50 bg-deep/30" />
    <Drawer.Content
      ref={ref}
      className={cn(
        "glass-strong fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] w-full max-w-lg rounded-t-3xl p-4 pb-8 outline-none",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/15" />
      {children}
    </Drawer.Content>
  </Drawer.Portal>
));
SheetContent.displayName = "SheetContent";
