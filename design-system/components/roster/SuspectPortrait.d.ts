import * as React from "react";

export interface SuspectPortraitProps {
  /** Built-in noir bust. */
  who?: "curator" | "assessor" | "collector";
  /** Letter monogram, rendered when `who` is absent (bring-your-own witness). */
  initial?: string;
  /** 0–1 pressure — warms the shadow half toward oxblood. */
  pressure?: number;
  className?: string;
}

/** Stylised, split-lit noir bust for a witness. */
export function SuspectPortrait(props: SuspectPortraitProps): JSX.Element;
