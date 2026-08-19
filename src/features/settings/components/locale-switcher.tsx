"use client";

import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {useTransition} from "react";
import {updateLocaleAction} from "@/features/settings/actions";
import type {AppLocale} from "@/i18n/routing";
import {cn} from "@/lib/utils";

const locales: AppLocale[] = ["uk", "en"];

export function LocaleSwitcher({className}: Readonly<{className?: string}>) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations("Locale");
  const [pending, startTransition] = useTransition();

  return (
    <div aria-label={t("label")} className={cn("glass-control inline-grid grid-cols-2 rounded-2xl p-1", className)}>
      {locales.map((item) => {
        const active = locale === item;

        return (
          <button
            key={item}
            aria-pressed={active}
            className={cn(
              "h-10 rounded-xl px-4 text-sm font-bold transition disabled:opacity-60",
              active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"
            )}
            disabled={pending}
            type="button"
            onClick={() => {
              startTransition(async () => {
                await updateLocaleAction(item);
                router.refresh();
              });
            }}
          >
            {t(`${item}Short`)}
          </button>
        );
      })}
    </div>
  );
}
