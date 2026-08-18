"use client";

import Link from "next/link";
import type {Route} from "next";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Layers3,
  RotateCcw,
  Settings,
  TextSearch
} from "lucide-react";
import {cn} from "@/lib/utils";

export const navItems = [
  {href: "/today", labelKey: "today", icon: CalendarDays},
  {href: "/learn", labelKey: "learn", icon: BookOpen},
  {href: "/review", labelKey: "review", icon: RotateCcw},
  {href: "/words", labelKey: "words", icon: TextSearch},
  {href: "/decks", labelKey: "decks", icon: Layers3},
  {href: "/stats", labelKey: "stats", icon: BarChart3},
  {href: "/settings", labelKey: "settings", icon: Settings}
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="glass-surface mx-auto grid h-[68px] max-w-md grid-cols-7 rounded-[26px] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.endsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[20px] text-[10px] font-semibold text-muted-foreground transition duration-200 active:scale-95",
                active && "text-primary"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-2xl transition",
                  active && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                )}
              >
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="w-full truncate px-0.5 text-center">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  return (
    <nav className="hidden sm:block">
      <div className="glass-surface sticky top-20 space-y-1 rounded-[30px] p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.endsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[22px] px-3 py-3 text-sm font-semibold text-muted-foreground transition duration-200 hover:bg-white/24 dark:hover:bg-white/8",
                active && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
