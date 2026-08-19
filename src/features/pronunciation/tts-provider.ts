export type SpeakFailureReason = "empty" | "unsupported" | "interrupted" | "error";

export type SpeakResult =
  | {ok: true}
  | {ok: false; reason: SpeakFailureReason};

export type SpeakRequest = {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceName?: string;
};

export interface TextToSpeechProvider {
  readonly id: string;
  isSupported(): boolean;
  speak(request: SpeakRequest): Promise<SpeakResult>;
  stop(): void;
  getVoices(): SpeechSynthesisVoice[];
  getPreferredVoice(): SpeechSynthesisVoice | null;
}

const DEFAULT_LANG = "en-US";
const MIN_RATE = 0.6;
const MAX_RATE = 1.35;
const DEFAULT_RATE = 0.95;

export function clampSpeechRate(rate: number | undefined) {
  if (typeof rate !== "number" || Number.isNaN(rate)) return DEFAULT_RATE;
  return Math.min(MAX_RATE, Math.max(MIN_RATE, rate));
}

class BrowserSpeechSynthesisProvider implements TextToSpeechProvider {
  readonly id = "browser-speech-synthesis";

  private activeUtterance: SpeechSynthesisUtterance | null = null;

  isSupported() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    );
  }

  getVoices() {
    const synth = this.getSynth();
    return synth?.getVoices() ?? [];
  }

  getPreferredVoice() {
    const englishVoices = this.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
    if (englishVoices.length === 0) return null;

    return [...englishVoices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] ?? null;
  }

  async speak(request: SpeakRequest): Promise<SpeakResult> {
    const text = request.text.trim();
    if (!text) return {ok: false, reason: "empty"};
    if (!this.isSupported()) {
      return {
        ok: false,
        reason: "unsupported"
      };
    }

    this.stop();
    await this.waitForVoices();

    const synth = this.getSynth();
    if (!synth) {
      return {
        ok: false,
        reason: "unsupported"
      };
    }

    return new Promise<SpeakResult>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const preferredVoice =
        request.voiceName != null
          ? this.getVoices().find((voice) => voice.name === request.voiceName)
          : this.getPreferredVoice();

      utterance.lang = preferredVoice?.lang ?? request.lang ?? DEFAULT_LANG;
      utterance.voice = preferredVoice ?? null;
      utterance.rate = clampSpeechRate(request.rate);
      utterance.pitch = request.pitch ?? 1;

      let settled = false;
      const settle = (result: SpeakResult) => {
        if (settled) return;
        settled = true;
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        resolve(result);
      };

      utterance.onend = () => settle({ok: true});
      utterance.onerror = (event) => {
        const interrupted = event.error === "interrupted" || event.error === "canceled";
        settle({
          ok: false,
          reason: interrupted ? "interrupted" : "error"
        });
      };

      this.activeUtterance = utterance;
      synth.speak(utterance);
    });
  }

  stop() {
    const synth = this.getSynth();
    if (!synth) return;
    synth.cancel();
    this.activeUtterance = null;
  }

  private getSynth() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    return window.speechSynthesis;
  }

  private waitForVoices() {
    if (!this.isSupported() || this.getVoices().length > 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const synth = this.getSynth();
      if (!synth) {
        resolve();
        return;
      }
      const currentSynth = synth;

      const timeout = window.setTimeout(() => {
        currentSynth.removeEventListener("voiceschanged", onVoicesChanged);
        resolve();
      }, 400);

      function onVoicesChanged() {
        window.clearTimeout(timeout);
        currentSynth.removeEventListener("voiceschanged", onVoicesChanged);
        resolve();
      }

      currentSynth.addEventListener("voiceschanged", onVoicesChanged);
    });
  }
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  let score = 0;

  if (lang === "en-us") score += 80;
  if (lang === "en-gb") score += 65;
  if (lang.startsWith("en")) score += 50;
  if (voice.default) score += 12;
  if (voice.localService) score += 8;
  if (name.includes("samantha") || name.includes("daniel") || name.includes("google us english")) {
    score += 8;
  }
  if (name.includes("microsoft") || name.includes("apple")) score += 4;

  return score;
}

let browserProvider: TextToSpeechProvider | null = null;

export function getBrowserTextToSpeechProvider() {
  browserProvider ??= new BrowserSpeechSynthesisProvider();
  return browserProvider;
}
