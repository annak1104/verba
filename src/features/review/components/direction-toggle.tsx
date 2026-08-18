"use client";

import {useTransition} from "react";
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {updateLearningDirectionAction} from "@/features/settings/actions";
import type {LearningDirection} from "@/features/vocabulary/types";
import {cn} from "@/lib/utils";

const directions: Array<{value: LearningDirection; left: string; right: string; label: string}> = [
  {value: "english_to_ukrainian", left: "EN", right: "UK", label: "EN to UK"},
  {value: "ukrainian_to_english", left: "UK", right: "EN", label: "UK to EN"}
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
            title={direction.label}
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
