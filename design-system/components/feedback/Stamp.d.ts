import * as React from "react";

export interface StampProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Verdict tone → palette. @default "contradicted" */
  tone?: "grounded" | "contradicted" | "silent" | "brass";
  /** Size ramp. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Override the rotation jitter, in degrees (e.g. -7). */
  rotate?: number;
  /** Play the punch-in animation on mount. @default true */
  animated?: boolean;
  children?: React.ReactNode;
}

/**
 * The inked verdict impression — the signature gesture of Evidence Engine.
 *
 * @startingPoint section="Feedback" subtitle="The inked verdict stamp" viewport="700x150"
 */
export function Stamp(props: StampProps): JSX.Element;
