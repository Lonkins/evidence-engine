import { useEffect, useRef } from "react";
import type { ChallengeResponse } from "./types";

const VERDICT_WORD: Record<ChallengeResponse["evidence"]["verdict"], string> = {
  SUPPORTED: "Grounded.",
  CONTRADICTED: "Contradicted.",
  UNSUPPORTED: "Unverifiable. The source is silent.",
};

/**
 * Voiced verdict (Accessibility). When a new challenge resolves and voice is on,
 * speak the challenged claim, then the verdict, then its cited passage — so the
 * catch is *heard*, not only seen. Hearing a confident AI lie and then hearing
 * it caught lands differently than reading it.
 *
 * Opt-in (off by default), speaks each resolved claim once, cancels in-flight
 * speech on a new verdict or unmount, and degrades silently where the Web Speech
 * API is unavailable. Pure browser-side; no engine or network involvement.
 */
export function useVerdictSpeech(latest: ChallengeResponse | null, enabled: boolean): void {
  const spokenKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !latest) return;
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;

    const key = `${latest.claimId}:${latest.evidence.verdict}`;
    if (spokenKey.current === key) return;
    spokenKey.current = key;

    const ungrounded = latest.evidence.source === "ungrounded";
    const verdict = ungrounded
      ? "No record. Her word stands."
      : VERDICT_WORD[latest.evidence.verdict];
    const passage = latest.evidence.citations[0]?.excerpt ?? "";
    const lines = [
      `You challenged: ${latest.claimText}.`,
      verdict,
      passage ? `The file says: ${passage}` : "",
    ].filter(Boolean);

    synth.cancel();
    lines.forEach((line, index) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.rate = 0.98;
      // Drop the pitch on the verdict line so the "gavel" lands.
      utterance.pitch = index === 1 ? 0.85 : 1;
      synth.speak(utterance);
    });

    return () => {
      synth.cancel();
    };
  }, [latest, enabled]);
}
