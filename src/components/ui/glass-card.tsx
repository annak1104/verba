import * as React from "react";
import {cn} from "@/lib/utils";

export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {interactive?: boolean}
>(({className, interactive = false, ...props}, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass-surface animate-in-soft rounded-[30px] text-card-foreground",
      interactive && "transition duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.99]",
      className
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";

export function GlassSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("space-y-4", className)} {...props} />;
}
