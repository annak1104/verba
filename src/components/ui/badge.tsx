import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-white/35 bg-secondary/80 text-secondary-foreground",
        outline: "border-white/35 bg-card/50 text-foreground"
      }
    },
    defaultVariants: {
      variant: "secondary"
    }
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({variant}), className)} {...props} />;
}
