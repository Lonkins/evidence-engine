import { useState } from "react";
import type { ChallengeResponse } from "../../live/types";
import "./live.css";

interface GroundingRecordProps {
  /** Every challenge resolved this session, keyed by claimId. */
  challenges: Record<string, ChallengeResponse>;
  /** What the witnesses are grounded in (case name or BYO source title). */
  sourceLabel: string;
  onClose: () => void;
}

type RecordVerdict = "grounded" | "contradicted" | "unverifiable";

interface RecordRow {
  claimId: string;
  speaker: string;
  claim: string;
  verdict: RecordVerdict;
  /** Foundry IQ's grounded statement — what the source actually says. */
  sourceSays: string | null;
  docKeys: string[];
}

const VERDICT_LABEL: Record<RecordVerdict, string> = {
  grounded: "Grounded",
  contradicted: "Contradicted",
  unverifiable: "Unverifiable",
};

const DISCLAIMER =
  "These labels reflect agreement with your source, not real-world truth. " +
  "Contradicted = conflicts with the source; unverifiable = the source is silent. " +
  "The source itself is not verified.";

/**
 * Turn the session's resolved challenges into record rows. "Pull the plug"
 * (ungrounded) results are excluded — nothing was actually checked.
 */
function toRows(challenges: Record<string, ChallengeResponse>): RecordRow[] {
  const rows: RecordRow[] = [];
  for (const result of Object.values(challenges)) {
    const ev = result.evidence;
    if (ev.source === "ungrounded") continue;
    const verdict: RecordVerdict =
      ev.verdict === "SUPPORTED"
        ? "grounded"
        : ev.verdict === "CONTRADICTED"
        ? "contradicted"
        : "unverifiable";
    rows.push({
      claimId: result.claimId,
      speaker: result.speaker,
      claim: result.claimText,
      verdict,
      sourceSays: ev.iq?.justification ?? ev.iq?.citedPassage ?? ev.citations[0]?.excerpt ?? null,
      docKeys: ev.citations.map((c) => c.docKey),
    });
  }
  return rows;
}

function rowLine(row: RecordRow): string {
  if (row.verdict === "grounded") {
    return `Backed by your source${row.docKeys[0] ? ` (${row.docKeys[0]})` : ""}.`;
  }
  if (row.verdict === "contradicted") {
    return `Your source says: ${row.sourceSays ?? "(conflicting passage cited)"}`;
  }
  return "Your source is silent on this — held back.";
}

function buildMarkdown(rows: RecordRow[], sourceLabel: string, counts: Record<RecordVerdict, number>): string {
  const lines: string[] = [];
  lines.push(`# The Grounding Record — ${sourceLabel}`);
  lines.push("");
  lines.push(`**${counts.grounded} grounded · ${counts.contradicted} contradicted · ${counts.unverifiable} unverifiable**`);
  lines.push("");
  lines.push(`> ${DISCLAIMER}`);
  lines.push("");
  for (const row of rows) {
    lines.push(`- **[${VERDICT_LABEL[row.verdict]}]** “${row.claim}” — ${row.speaker}`);
    lines.push(`  - ${rowLine(row)}`);
  }
  lines.push("");
  lines.push("_Checked against the source by Foundry IQ (Azure AI Search)._");
  return lines.join("\n");
}

/**
 * The Grounding Record (the "so what"): the catch produces an artifact. Each
 * challenged claim is filed against the source — grounded claims kept with their
 * citation, contradicted claims shown next to what the source actually says,
 * unverifiable claims held back. A cited record you build by interrogating a
 * liar. Counts, never a score; faithfulness to the source, never truth.
 */
export function GroundingRecord({ challenges, sourceLabel, onClose }: GroundingRecordProps) {
  const [copied, setCopied] = useState(false);
  const rows = toRows(challenges);
  const counts: Record<RecordVerdict, number> = {
    grounded: rows.filter((r) => r.verdict === "grounded").length,
    contradicted: rows.filter((r) => r.verdict === "contradicted").length,
    unverifiable: rows.filter((r) => r.verdict === "unverifiable").length,
  };

  const exportRecord = () => {
    const markdown = buildMarkdown(rows, sourceLabel, counts);
    void navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div className="doc-modal record-modal" role="dialog" aria-modal="true" aria-label="The grounding record">
      <div className="doc-modal__backdrop" onClick={onClose} />
      <article className="doc-modal__paper record-modal__paper">
        <header className="record-modal__head">
          <p className="micro-label">The Grounding Record</p>
          <h2 className="record-modal__title">
            What “{sourceLabel}” backs, contradicts, and can't speak to
          </h2>
          <p className="record-counts">
            <span className="record-count record-count--grounded">{counts.grounded} grounded</span>
            <span className="record-count record-count--contradicted">{counts.contradicted} contradicted</span>
            <span className="record-count record-count--unverifiable">{counts.unverifiable} unverifiable</span>
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="record-empty">
            Challenge a claim and it lands here — each one checked against your source by
            Foundry IQ, kept with its citation or held back.
          </p>
        ) : (
          <ol className="record-rows">
            {rows.map((row) => (
              <li key={row.claimId} className={`record-row record-row--${row.verdict}`}>
                <p className="record-row__claim">
                  “{row.claim}” <span className="record-row__speaker">— {row.speaker}</span>
                </p>
                <p className="record-row__verdict">{VERDICT_LABEL[row.verdict]}</p>
                <p className="record-row__source">{rowLine(row)}</p>
              </li>
            ))}
          </ol>
        )}

        <p className="record-disclaimer">{DISCLAIMER}</p>

        <footer className="record-modal__actions">
          <button
            className="report__action report__action--primary"
            onClick={exportRecord}
            disabled={rows.length === 0}
          >
            {copied ? "Copied to clipboard ✓" : "Export the record"}
          </button>
          <button className="report__action" onClick={onClose}>
            Back to the interrogation
          </button>
        </footer>
      </article>
    </div>
  );
}
