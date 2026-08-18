import {describe, expect, it} from "vitest";
import {clampSpeechRate} from "@/features/pronunciation/tts-provider";

describe("speech rate", () => {
  it("clamps SpeechSynthesis rate to the supported app range", () => {
    expect(clampSpeechRate(0.2)).toBe(0.6);
    expect(clampSpeechRate(1)).toBe(1);
    expect(clampSpeechRate(2)).toBe(1.35);
    expect(clampSpeechRate(Number.NaN)).toBe(0.95);
  });
});
