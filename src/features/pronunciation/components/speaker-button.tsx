"use client";

import {Volume2, VolumeX} from "lucide-react";
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
  label = "Speak English",
  showLabel = false,
  className,
  disabled,
  size = "icon",
  variant = "glass",
  ...props
}: Readonly<SpeakerButtonProps>) {
  const {message, speak, speaking, supported} = useTextToSpeech();
  const canSpeak = supported && text.trim().length > 0;
  const title = !supported
    ? "Speech synthesis is not supported in this browser."
    : message ?? label;

  return (
    <Button
      aria-label={label}
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
      {showLabel ? <span>{speaking ? "Speaking" : "Speak"}</span> : null}
    </Button>
  );
}
