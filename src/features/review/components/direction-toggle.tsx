"use client";

import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {updateLearningDirectionAction} from "@/features/settings/actions";
import type {LearningDirection} from "@/features/vocabulary/types";
import {cn} from "@/lib/utils";

const directions: Array<{
  value: LearningDirection;
  left: string;
  right: string;
  labelKey: "directionEnUk" | "directionUkEn";
}> = [
  {value: "english_to_ukrainian", left: "EN", right: "UK", labelKey: "directionEnUk"},
  {value: "ukrainian_to_english", left: "UK", right: "EN", labelKey: "directionUkEn"}
];

export function DirectionToggle({
  value,
  onValueChange,
  className
}: Readonly<{
  value: LearningDirection;
  onValueChange?: (value: LearningDirection) => void;
  className?: string;
}>) {
  const t = useTranslations("Review");
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("glass-control inline-grid grid-cols-2 rounded-2xl p-1", className)}>
      {directions.map((direction) => {
        const active = value === direction.value;

        return (
          <Button
            key={direction.value}
            aria-pressed={active}
            className={cn(
              "h-10 rounded-xl px-3 text-xs shadow-none",
              active ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
            )}
            disabled={pending}
            title={t(direction.labelKey)}
            type="button"
            variant={active ? "default" : "ghost"}
            onClick={() => {
              onValueChange?.(direction.value);
              startTransition(async () => {
                await updateLearningDirectionAction(direction.value);
              });
            }}
          >
            <span>{direction.left}</span>
            <ArrowRight className="size-3.5" />
            <span>{direction.right}</span>
          </Button>
        );
      })}
    </div>
  );
}
