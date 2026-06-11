import "./live.css";

export type DeskMode = "casefile" | "live";

interface ModeSwitchProps {
  mode: DeskMode;
  onSwitch: (mode: DeskMode) => void;
}

/**
 * The wiretap switch — flips the desk between the offline Case File (static,
 * judge-without-keys path) and the Live Wire (open interrogation through the
 * live backend). Honest labelling: each side says exactly what it talks to.
 */
export function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="Desk mode">
      <button
        className={`mode-switch__side ${mode === "casefile" ? "mode-switch__side--on" : ""}`}
        onClick={() => onSwitch("casefile")}
        aria-pressed={mode === "casefile"}
        title="Scripted case — fully offline, no keys, no backend"
      >
        Case file
      </button>
      <button
        className={`mode-switch__side mode-switch__side--live ${
          mode === "live" ? "mode-switch__side--on" : ""
        }`}
        onClick={() => onSwitch("live")}
        aria-pressed={mode === "live"}
        title="Open interrogation — live Foundry IQ + GitHub Models via the backend"
      >
        <span className="live-dot" aria-hidden="true" /> Live wire
      </button>
    </div>
  );
}
