import * as React from "react";

export interface CitationSlipProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Document title, shown in stencil caps. */
  docTitle: React.ReactNode;
  /** Document kind (e.g. "statement", "technical record"). */
  kind?: React.ReactNode;
  /** The verbatim cited passage. */
  quote: React.ReactNode;
  /** If provided, the slip becomes a button that opens the source. */
  onOpen?: () => void;
}

/**
 * A cited passage as a pinned paper exhibit — the receipt the engine hands back.
 *
 * @startingPoint section="Evidence" subtitle="Cited passage as a paper exhibit slip" viewport="700x180"
 */
export function CitationSlip(props: CitationSlipProps): JSX.Element;
