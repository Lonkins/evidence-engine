import "./live.css";

export type DeskMode = "casefile" | "live";

interface ModeSwitchProps {
  mode: DeskMode;
  onSwitch: (mode: DeskMode) => void;
}

/**
 * The act switch — moves between Act I (scripted training case, fully offline,
 * judge-without-keys path) and Act II (live interrogation: a real model on the
 * stand via the backend). Honest labelling: each side says who is speaking.
 */
export function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="Act selection">
      <button
        className={`mode-switch__side ${mode === "casefile" ? "mode-switch__side--on" : ""}`}
        onClick={() => onSwitch("casefile")}
        aria-pressed={mode === "casefile"}
        title="Act I — training case: scripted answers, pre-checked verdicts, fully offline"
      >
        Act I · Training case
        <span className="mode-switch__sub">scripted · offline</span>
      </button>
      <button
        className={`mode-switch__side mode-switch__side--live ${
          mode === "live" ? "mode-switch__side--on" : ""
        }`}
        onClick={() => onSwitch("live")}
        aria-pressed={mode === "live"}
        title="Act II — live interrogation: a real AI witness, checked against Foundry IQ on every turn"
      >
        <span className="live-dot" aria-hidden="true" /> Act II · Live interrogation
        <span className="mode-switch__sub">real AI witness</span>
      </button>
    </div>
  );
}
