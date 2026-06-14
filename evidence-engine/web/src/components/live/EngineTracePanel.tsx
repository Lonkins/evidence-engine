import { useEffect, useRef } from "react";
import type { Scorecard, TraceEntry } from "../../live/types";
import "./live.css";

interface EngineTracePanelProps {
  trace: TraceEntry[];
  score: Scorecard | null;
  /** Foundry IQ grounding on/off — the "pull the plug" switch. */
  grounding: boolean;
  onToggleGrounding: () => void;
  onEndSession: () => void;
  canEnd: boolean;
}

function totalCatches(score: Scorecard | null): number {
  if (!score) return 0;
  return score.contradictionsPinned + score.selfContradictionsExposed;
}

const ORIGIN_LABEL = {
  azure: "AZURE",
  model: "MODEL",
  heuristic: "LOCAL",
} as const;

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
export function EngineTracePanel({
  trace,
  score,
  grounding,
  onToggleGrounding,
  onEndSession,
  canEnd,
}: EngineTracePanelProps) {
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
          Every step, tagged by who did the work: AZURE = live Foundry IQ retrieval and
          indexing, MODEL = GitHub Models turn, LOCAL = deterministic verdict heuristics
          over the retrieved passages.
        </p>
      </header>

      <p className="engine-tap__objective">
        <span className="engine-tap__objective-label">Objective</span>
        Crack the witnesses: pin{" "}
        <strong>{Math.max(0, 3 - totalCatches(score))} more</strong> contradiction
        {Math.max(0, 3 - totalCatches(score)) === 1 ? "" : "s"} against the record.
      </p>

      <div className={`engine-tap__grounding ${grounding ? "" : "engine-tap__grounding--off"}`}>
        <div className="engine-tap__grounding-text">
          <span className="micro-label">Foundry IQ grounding</span>
          <p className="engine-tap__grounding-state">
            {grounding
              ? "ON — every claim is checked against the case file, live."
              : "OFF — the engine has nothing to check against. Her word stands."}
          </p>
        </div>
        <button
          type="button"
          className={`engine-tap__plug ${grounding ? "engine-tap__plug--on" : "engine-tap__plug--off"}`}
          onClick={onToggleGrounding}
          role="switch"
          aria-checked={grounding}
          aria-label="Toggle Foundry IQ grounding"
          title={grounding ? "Pull the plug on Foundry IQ" : "Plug Foundry IQ back in"}
        >
          <span className="engine-tap__plug-track" aria-hidden="true">
            <span className="engine-tap__plug-knob" />
          </span>
          <span className="engine-tap__plug-label">{grounding ? "ON" : "OFF"}</span>
        </button>
      </div>

      {score && (
        <dl className="engine-tap__score" aria-label="Interrogation scorecard">
          <div className="tap-tally tap-tally--gold">
            <dt>Pinned</dt>
            <dd>{score.contradictionsPinned + score.selfContradictionsExposed}</dd>
          </div>
          <div className="tap-tally">
            <dt>File silent</dt>
            <dd>{score.flaggedUnverifiable}</dd>
          </div>
          <div className="tap-tally tap-tally--crimson">
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
            <span className="tap-line__step">
              <span className={`tap-origin tap-origin--${entry.origin}`}>
                {ORIGIN_LABEL[entry.origin]}
              </span>
              {entry.step}
            </span>
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
