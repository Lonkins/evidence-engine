import type { Scorecard } from "../../live/types";
import { Stamp } from "../ui/Stamp";
import "./live.css";

interface InterrogationReportProps {
  score: Scorecard;
  deletedTestimonyDocs: number;
  onNewSession: () => void;
  onBackToCaseFile: () => void;
}

function gradeFor(score: Scorecard): { stamp: string; line: string } {
  const caught = score.contradictionsPinned + score.selfContradictionsExposed;
  if (caught >= 3 && score.falseObjections === 0) {
    return {
      stamp: "Relentless",
      line: "Nothing they invented survived contact with the case file.",
    };
  }
  if (caught >= 1) {
    return {
      stamp: "Sharp",
      line: "You caught the record disagreeing with the testimony — that's the job.",
    };
  }
  return {
    stamp: "Green",
    line: "No contradictions pinned this session. The file was ready; press harder.",
  };
}

/** End-of-session interrogation report — the live mode's set-piece close. */
export function InterrogationReport({
  score,
  deletedTestimonyDocs,
  onNewSession,
  onBackToCaseFile,
}: InterrogationReportProps) {
  const grade = gradeFor(score);

  return (
    <div className="doc-modal report" role="dialog" aria-modal="true" aria-label="Interrogation report">
      <div className="doc-modal__backdrop" />
      <article className="doc-modal__paper report__paper">
        <header className="report__head">
          <p className="micro-label">Camden CID · Act III — The Debrief</p>
          <Stamp tone="gold" large>{grade.stamp}</Stamp>
          <p className="report__line">{grade.line}</p>
        </header>

        <p className="report__plants">
          Planted fabrications pinned:{" "}
          <strong>
            {score.plantsCaught} of {score.plantsTotal}
          </strong>{" "}
          — each witness was scripted to assert one specific false detail. These are
          ground truth: catching one means it provably was fabricated.
        </p>

        <dl className="report__grid">
          <div className="report__stat">
            <dt>Questions put</dt>
            <dd>{score.turns}</dd>
          </div>
          <div className="report__stat">
            <dt>Claims challenged</dt>
            <dd>{score.challenges}</dd>
          </div>
          <div className="report__stat report__stat--gold">
            <dt>Contradictions pinned</dt>
            <dd>{score.contradictionsPinned}</dd>
          </div>
          <div className="report__stat report__stat--crimson">
            <dt>Self-conflicts exposed</dt>
            <dd>{score.selfContradictionsExposed}</dd>
          </div>
          <div className="report__stat">
            <dt>Unverifiable (flagged)</dt>
            <dd>{score.flaggedUnverifiable}</dd>
          </div>
          <div className="report__stat">
            <dt>Objections overruled</dt>
            <dd>{score.falseObjections}</dd>
          </div>
        </dl>

        <div className="report__lesson">
          <p className="report__lesson-head">What you just practised</p>
          <ul className="report__lesson-list">
            <li>
              <strong>Fluent ≠ true.</strong> The witness answered confidently every
              time — including the times the record disagreed.
            </li>
            <li>
              <strong>A citation beats confidence.</strong> Every pin came from a
              retrieved passage, quoted verbatim — never from how convincing the
              answer sounded.
            </li>
            <li>
              <strong>"Unverifiable" is not "false".</strong> When the file was
              silent, the engine said so and refused to call it a lie. Demand the
              same honesty from any AI tool you rely on.
            </li>
          </ul>
        </div>

        <p className="report__smallprint">
          Verdicts are evidence-relative: “unsupported by the case file” or “conflicts
          with their earlier statement” — never a finding of fact. “File silent” means
          unverifiable, not false. The checks are bounded: paraphrased contradictions
          and conflicts that carry no clock times go undetected, and the engine can
          only see what this case file indexes. The witnesses were allowed to drift;
          the engine's job was to show you where the record disagrees — with the
          passage quoted, verbatim. ({deletedTestimonyDocs} testimony documents purged
          from the live index on closing.)
        </p>

        <footer className="report__actions">
          <button className="report__action report__action--primary" onClick={onNewSession}>
            Interrogate again
          </button>
          <button className="report__action" onClick={onBackToCaseFile}>
            Back to the training case
          </button>
        </footer>
      </article>
    </div>
  );
}
