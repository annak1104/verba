"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  const t = useTranslations("Common");

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          "glass-surface fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[30px] p-5 shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
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

function DialogHeader({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 pr-10", className)} {...props} />;
}

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export {Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription};
