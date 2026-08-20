import type {Route} from "next";
import Link from "next/link";
import {Ear, PenLine, RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GlassCard} from "@/components/ui/glass-card";
import {cn} from "@/lib/utils";
import {getTranslations} from "next-intl/server";

const modes = [
  {id: "add", labelKey: "add", href: "/learn", icon: PenLine},
  {id: "review", labelKey: "review", href: "/review", icon: RotateCcw},
  {id: "listening", labelKey: "listening", href: "/learn?mode=listening", icon: Ear}
] as const;

export async function LearnModes({active}: Readonly<{active: "add" | "listening"}>) {
  const t = await getTranslations("Learn.modes");

  return (
    <GlassCard className="grid grid-cols-3 gap-1.5 p-1.5">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const selected = active === mode.id || (active === "add" && mode.id === "add");

        return (
          <Button
            key={mode.id}
            asChild
            className={cn(
              "h-12 min-w-0 rounded-2xl px-3 text-[13px] sm:px-5 sm:text-sm",
              selected && "bg-primary text-primary-foreground"
            )}
            variant={selected ? "default" : "ghost"}
          >
            <Link href={mode.href as Route}>
              <Icon className="size-4" />
              <span className="truncate">{t(mode.labelKey)}</span>
            </Link>
          </Button>
        );
      })}
    </GlassCard>
  );
}
