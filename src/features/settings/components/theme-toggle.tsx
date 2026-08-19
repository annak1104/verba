"use client";

import {useTheme} from "next-themes";
import {useTranslations} from "next-intl";
import {Moon, Sun} from "lucide-react";
import {Button} from "@/components/ui/button";

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const {resolvedTheme, setTheme} = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={t("toggle")}
      size="icon"
      type="button"
      variant="glass"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
