import { useEffect, useRef } from "react";
import type { Scorecard, TraceEntry } from "../../live/types";
import "./live.css";

interface EngineTracePanelProps {
  trace: TraceEntry[];
  score: Scorecard | null;
  onEndSession: () => void;
  canEnd: boolean;
}

function stepGlyph(step: string): string {
  if (step.startsWith("kb.retrieve")) return "◉";
  if (step.startsWith("index.upload")) return "▲";
  if (step.startsWith("index.lookup")) return "▣";
  if (step.startsWith("index.scan")) return "≡";
  if (step.startsWith("index.delete") || step.startsWith("index.find")) return "✕";
  if (step.startsWith("llm")) return "✎";
  return "·";
}

/**
 * The wiretap — a teletype log of every live call the engine makes:
 * Foundry IQ retrieves, testimony indexing, document lookups, LLM turns.
 * This is the IQ layer made visible: method, target, latency, status.
 */
export function EngineTracePanel({ trace, score, onEndSession, canEnd }: EngineTracePanelProps) {
  const logRef = useRef<HTMLOListElement>(null);
  const traceCount = trace.length;

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [traceCount]);

  return (
    <aside className="engine-tap" aria-label="Engine trace — live Foundry IQ calls">
      <header className="engine-tap__head">
        <p className="micro-label">
          Engine tap <span className="live-dot" aria-hidden="true" />
        </p>
        <p className="engine-tap__sub">
          Every line is a live call — Foundry IQ retrieves, testimony indexing, model turns.
        </p>
      </header>

      {score && (
        <dl className="engine-tap__score" aria-label="Interrogation scorecard">
          <div className="tap-tally tap-tally--gold">
            <dt>Drift caught</dt>
            <dd>{score.hallucinationsCaught}</dd>
          </div>
          <div className="tap-tally tap-tally--crimson">
            <dt>Self-conflicts</dt>
            <dd>{score.selfContradictionsExposed}</dd>
          </div>
          <div className="tap-tally">
            <dt>Overruled</dt>
            <dd>{score.falseObjections}</dd>
          </div>
        </dl>
      )}

      <ol className="engine-tap__log" ref={logRef}>
        {trace.length === 0 && (
          <li className="tap-line tap-line--idle">— line open, waiting for traffic —</li>
        )}
        {trace.map((entry, index) => (
          <li key={index} className={`tap-line ${entry.status >= 400 ? "tap-line--error" : ""}`}>
            <span className="tap-line__glyph" aria-hidden="true">{stepGlyph(entry.step)}</span>
            <span className="tap-line__step">{entry.step}</span>
            <span className="tap-line__meta">
              {entry.method} · {entry.latencyMs}ms · {entry.status}
            </span>
            {entry.detail && <span className="tap-line__detail">{entry.detail}</span>}
            <span className="tap-line__target">{entry.target}</span>
          </li>
        ))}
        <li className="tap-line tap-line--cursor" aria-hidden="true">▮</li>
      </ol>

      <footer className="engine-tap__foot">
        <button className="engine-tap__end" onClick={onEndSession} disabled={!canEnd}>
          End interrogation · file report
        </button>
        <p className="engine-tap__cleanup-note">
          Ending the session deletes this session's testimony from the live index.
        </p>
      </footer>
    </aside>
  );
}
