import {cn} from "@/lib/utils";

export function Skeleton({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/35 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}
