import { useState } from "react";
import type { ByoConfig } from "../../live/api";
import "./briefing.css";

interface ByoIntakeProps {
  onSubmit: (config: ByoConfig) => void;
  onCancel: () => void;
}

const MIN_CHARS = 80;
const MAX_CHARS = 24000;

/**
 * "Bring your own trial" intake (Part 2): the user pastes their own source —
 * a spec, notes, a story, code — and we put a witness grounded in it on the
 * stand. Foundry IQ then checks the witness's claims against the user's material.
 */
export function ByoIntake({ onSubmit, onCancel }: ByoIntakeProps) {
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [witnessName, setWitnessName] = useState("");

  const trimmed = source.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_CHARS;
  const valid = trimmed.length >= MIN_CHARS && trimmed.length <= MAX_CHARS;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      source: trimmed,
      title: title.trim() || undefined,
      witnessName: witnessName.trim() || undefined,
    });
  };

  return (
    <div className="title-card byo-intake" role="main">
      <div className="title-card__rule" aria-hidden="true" />
      <p className="micro-label title-card__eyebrow">Bring your own trial</p>
      <h1 className="title-card__title byo-intake__title">
        Put your <em>own</em> source on the stand
      </h1>
      <p className="title-card__deck byo-intake__deck">
        Paste anything — a spec, your notes, a story, a chunk of code. Foundry IQ indexes
        it, and a witness takes the stand who only "knows" what you pasted. Grill them:
        every claim is checked against your source, live — grounded, contradicted, or
        flagged as something the AI simply made up.
      </p>

      <div className="byo-intake__fields">
        <label className="byo-intake__field">
          <span className="micro-label">Your source</span>
          <textarea
            className="byo-intake__textarea"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={9}
            placeholder="Paste a document, your notes, a story, or code…"
            maxLength={MAX_CHARS}
            aria-label="Your source material"
          />
          <span className="byo-intake__count">
            {trimmed.length}/{MAX_CHARS}
            {tooShort ? ` · at least ${MIN_CHARS} characters` : ""}
          </span>
        </label>

        <div className="byo-intake__row">
          <label className="byo-intake__field">
            <span className="micro-label">Title (optional)</span>
            <input
              className="byo-intake__input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Aurora Service Notes"
              maxLength={120}
            />
          </label>
          <label className="byo-intake__field">
            <span className="micro-label">Witness name (optional)</span>
            <input
              className="byo-intake__input"
              value={witnessName}
              onChange={(event) => setWitnessName(event.target.value)}
              placeholder="e.g. The Author"
              maxLength={60}
            />
          </label>
        </div>
      </div>

      <div className="byo-intake__actions">
        <button type="button" className="surface-link" onClick={onCancel}>
          Back
        </button>
        <button type="button" className="title-card__open" onClick={submit} disabled={!valid}>
          Put it on the stand
        </button>
      </div>
      <div className="title-card__rule" aria-hidden="true" />
    </div>
  );
}
