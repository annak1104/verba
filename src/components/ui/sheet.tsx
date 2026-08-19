"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "right";
}) {
  const t = useTranslations("Common");

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/35 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "glass-surface fixed z-50 outline-none",
          side === "bottom"
            ? "inset-x-2 bottom-2 rounded-[32px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            : "bottom-2 right-2 top-2 w-[min(26rem,calc(100vw-1rem))] rounded-[32px] p-5",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button className="absolute right-3 top-3" size="icon" variant="glass" aria-label={t("close")}>
            <X className="size-4" />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

export {Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription};
