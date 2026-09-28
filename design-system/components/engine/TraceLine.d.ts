import * as React from "react";

export interface TraceLineProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  /** The engine step, e.g. "kb.retrieve(evidence)". Drives the leading glyph. */
  step: string;
  /** Who did the work. @default "azure" */
  origin?: "azure" | "model" | "local";
  /** HTTP-ish method. @default "POST" */
  method?: string;
  /** Round-trip latency in ms. */
  latencyMs?: number;
  /** Status code; ≥400 renders the line in oxblood. @default 200 */
  status?: number;
  /** Optional second-line detail (the retrieved passage, the verdict). */
  detail?: React.ReactNode;
  /** Optional dim target (index name, doc key). */
  target?: React.ReactNode;
}

/**
 * One line of the engine wiretap — the live Foundry IQ layer made visible.
 * Render inside an `<ol class="ee-trace-log">`.
 */
export function TraceLine(props: TraceLineProps): JSX.Element;
