"use client";

import {Volume2, VolumeX} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button, type ButtonProps} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {DEFAULT_SPEECH_RATE, useTextToSpeech} from "@/features/pronunciation/use-text-to-speech";

type SpeakerButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  text: string;
  rate?: number;
  label?: string;
  showLabel?: boolean;
};

export function SpeakerButton({
  text,
  rate = DEFAULT_SPEECH_RATE,
  label,
  showLabel = false,
  className,
  disabled,
  size = "icon",
  variant = "glass",
  ...props
}: Readonly<SpeakerButtonProps>) {
  const t = useTranslations("Pronunciation");
  const {speak, speaking, status, supported} = useTextToSpeech();
  const canSpeak = supported && text.trim().length > 0;
  const buttonLabel = label ?? t("speakEnglish");
  const statusMessage =
    status === "empty"
      ? t("empty")
      : status === "unsupported"
        ? t("unsupported")
        : status === "error"
          ? t("error")
          : null;
  const title = !supported
    ? t("unsupported")
    : status == null
      ? buttonLabel
      : statusMessage ?? buttonLabel;

  return (
    <Button
      aria-label={buttonLabel}
      className={cn(speaking && "animate-pulse text-primary", className)}
      disabled={disabled || !canSpeak}
      size={size}
      title={title}
      type="button"
      variant={variant}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        void speak(text, rate);
      }}
      {...props}
    >
      {supported ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      {showLabel ? <span>{speaking ? t("speaking") : t("speak")}</span> : null}
    </Button>
  );
}
