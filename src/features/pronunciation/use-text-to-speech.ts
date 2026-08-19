"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {
  clampSpeechRate,
  getBrowserTextToSpeechProvider,
  type SpeakFailureReason,
  type SpeakResult
} from "@/features/pronunciation/tts-provider";

const SPEECH_RATE_STORAGE_KEY = "eng-words:speech-rate";
export const DEFAULT_SPEECH_RATE = 0.95;

export function useSpeechRate() {
  const [rate, setRateState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_SPEECH_RATE;
    const stored = window.localStorage.getItem(SPEECH_RATE_STORAGE_KEY);
    return stored == null ? DEFAULT_SPEECH_RATE : clampSpeechRate(Number(stored));
  });

  const setRate = useCallback((nextRate: number) => {
    const clamped = clampSpeechRate(nextRate);
    setRateState(clamped);
    window.localStorage.setItem(SPEECH_RATE_STORAGE_KEY, String(clamped));
  }, []);

  return {rate, setRate};
}

export function useTextToSpeech() {
  const providerRef = useRef(getBrowserTextToSpeechProvider());
  const requestIdRef = useRef(0);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState<SpeakFailureReason | null>(null);

  useEffect(() => {
    const provider = providerRef.current;
    setSupported(provider.isSupported());
  }, []);

  const speak = useCallback(async (text: string, rate = DEFAULT_SPEECH_RATE): Promise<SpeakResult> => {
    const provider = providerRef.current;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!provider.isSupported()) {
      const result: SpeakResult = {
        ok: false,
        reason: "unsupported"
      };
      setSupported(false);
      setStatus("unsupported");
      return result;
    }

    setSupported(true);
    setSpeaking(true);
    setStatus(null);

    const result = await provider.speak({text, rate, lang: "en-US"});
    if (requestIdRef.current === requestId) {
      setSpeaking(false);
      setStatus(result.ok || result.reason === "interrupted" ? null : result.reason);
    }

    return result;
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    providerRef.current.stop();
    setSpeaking(false);
  }, []);

  return {speak, speaking, status, stop, supported};
}
