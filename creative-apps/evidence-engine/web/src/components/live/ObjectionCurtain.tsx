import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Stamp, type StampTone } from "../ui/Stamp";
import type { ChallengeResponse } from "../../live/types";
import "./live.css";

type Phase = "idle" | "objection" | "slam";

const SLAM_TONE: Record<
  ChallengeResponse["evidence"]["verdict"],
  { tone: StampTone; text: string }
> = {
  SUPPORTED: { tone: "verified", text: "Grounded" },
  CONTRADICTED: { tone: "contradicted", text: "Contradicted" },
  UNSUPPORTED: { tone: "silent", text: "Unverifiable" },
};

const SLAM_MS = 1300;

interface ObjectionCurtainProps {
  /** True while a live challenge (the Foundry IQ reason call) is in flight. */
  pending: boolean;
  /** The most recently resolved challenge — drives the slam stamp. */
  latest: ChallengeResponse | null;
}

/**
 * The challenge moment as theatre. While Foundry IQ reasons over the case file
 * (the live answer-synthesis call, ~2-3s), a translucent OBJECTION curtain holds
 * the room — the engine tap still glows behind it, so judges keep watching the
 * brain work — and when the verdict resolves the stamp slams, then fades to
 * reveal the verdict card. Pure presentation over existing live state: no engine
 * changes, pointer-events none, honours prefers-reduced-motion, and gated by a
 * kill-switch in LiveDesk so the bare path can always be demoed.
 */
export function ObjectionCurtain({ pending, latest }: ObjectionCurtainProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const wasPending = useRef(false);
  const slamResult = useRef<ChallengeResponse | null>(null);

  useEffect(() => {
    const wasPendingPrev = wasPending.current;
    wasPending.current = pending;

    if (pending && !wasPendingPrev) {
      setPhase("objection");
      return;
    }
    if (!pending && wasPendingPrev) {
      slamResult.current = latest;
      if (latest) {
        setPhase("slam");
        const id = setTimeout(() => setPhase("idle"), SLAM_MS);
        return () => clearTimeout(id);
      }
      setPhase("idle");
    }
  }, [pending, latest]);

  if (phase === "idle") return null;

  const result = slamResult.current;
  const ungrounded = result?.evidence.source === "ungrounded";
  const verdict = result ? SLAM_TONE[result.evidence.verdict] : null;

  return createPortal(
    <div className={`objection objection--${phase}`} role="presentation" aria-hidden="true">
      {phase === "objection" ? (
        <div className="objection__call">
          <span className="objection__word">Objection</span>
          <span className="objection__sub">Foundry IQ is checking the case file…</span>
        </div>
      ) : (
        verdict && (
          <div className="objection__slam">
            <Stamp tone={ungrounded ? "silent" : verdict.tone} large>
              {ungrounded ? "No record" : verdict.text}
            </Stamp>
          </div>
        )
      )}
    </div>,
    document.body
  );
}
