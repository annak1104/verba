"use client";

import {useTranslations} from "next-intl";
import {cn} from "@/lib/utils";

export function SpeechRateControl({
  rate,
  onRateChange,
  className
}: Readonly<{rate: number; onRateChange: (rate: number) => void; className?: string}>) {
  const t = useTranslations("Pronunciation");

  return (
    <label
      className={cn(
        "glass-control flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold",
        className
      )}
    >
      <span className="shrink-0 text-muted-foreground">{t("speech")}</span>
      <input
        aria-label={t("speechRate")}
        className="min-w-0 flex-1 accent-primary"
        max={1.35}
        min={0.6}
        step={0.05}
        type="range"
        value={rate}
        onChange={(event) => onRateChange(Number(event.target.value))}
      />
      <span className="w-12 text-right tabular-nums text-muted-foreground">{rate.toFixed(2)}x</span>
    </label>
  );
}
