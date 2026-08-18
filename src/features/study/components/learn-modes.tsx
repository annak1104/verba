import type {Route} from "next";
import Link from "next/link";
import {Ear, PenLine, RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GlassCard} from "@/components/ui/glass-card";
import {cn} from "@/lib/utils";

const modes = [
  {id: "add", label: "Add Word", href: "/learn", icon: PenLine},
  {id: "review", label: "Flashcards", href: "/review", icon: RotateCcw},
  {id: "listening", label: "Listening", href: "/learn?mode=listening", icon: Ear}
] as const;

export function LearnModes({active}: Readonly<{active: "add" | "listening"}>) {
  return (
    <GlassCard className="grid grid-cols-3 gap-1 p-1.5">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const selected = active === mode.id || (active === "add" && mode.id === "add");

        return (
          <Button
            key={mode.id}
            asChild
            className={cn("h-11 rounded-2xl px-2 text-xs", selected && "bg-primary text-primary-foreground")}
            variant={selected ? "default" : "ghost"}
          >
            <Link href={mode.href as Route}>
              <Icon className="size-4" />
              {mode.label}
            </Link>
          </Button>
        );
      })}
    </GlassCard>
  );
}
