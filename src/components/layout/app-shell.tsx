import {UserButton} from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server";
import type {Route} from "next";
import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {BookMarked, Languages} from "lucide-react";
import {BottomNav, DesktopNav} from "@/components/layout/bottom-nav";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/features/settings/components/theme-toggle";

const todayRoute = "/today" as Route;
const signInRoute = "/sign-in" as Route;

export async function AppShell({children}: Readonly<{children: React.ReactNode}>) {
  const t = await getTranslations("App");
  const {userId} = await auth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="safe-px sticky top-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="glass-surface mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-[28px] px-3 sm:px-4">
          <Link href={todayRoute} className="flex min-w-0 items-center gap-2" aria-label={t("name")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-[18px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Languages className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold leading-5">{t("name")}</span>
              <span className="block truncate text-xs text-muted-foreground">{t("tagline")}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {userId ? (
              <UserButton />
            ) : (
              <Button asChild size="sm" variant="glass">
                <Link href={signInRoute}>
                  <BookMarked className="size-4" />
                  {t("learn")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="safe-px mx-auto grid w-full max-w-6xl gap-5 pt-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:pt-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <DesktopNav />
        <main className="min-w-0 pb-28 sm:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
