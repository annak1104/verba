import {UserButton} from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server";
import type {Route} from "next";
import Image from "next/image";
import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {BookMarked} from "lucide-react";
import {BottomNav, DesktopNav} from "@/components/layout/bottom-nav";
import {Button} from "@/components/ui/button";
import {LocaleSwitcher} from "@/features/settings/components/locale-switcher";
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
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-background/60 shadow-sm ring-1 ring-border">
              <Image
                alt=""
                aria-hidden
                className="size-full object-contain"
                height={40}
                priority
                src="/brand/verba-logo.png"
                width={40}
              />
            </span>
            <span className="block min-w-0 truncate text-[17px] font-bold leading-5">{t("name")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <LocaleSwitcher className="hidden sm:inline-grid" />
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
