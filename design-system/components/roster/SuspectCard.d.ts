import * as React from "react";

export interface SuspectCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Witness name. */
  name: React.ReactNode;
  /** Role, shown in stencil caps (e.g. "Head Curator"). */
  role?: React.ReactNode;
  /** One-line hook beneath the name. */
  hook?: React.ReactNode;
  /** Built-in noir bust: `curator` | `assessor` | `collector`. */
  who?: "curator" | "assessor" | "collector";
  /** Letter monogram for a bring-your-own witness (used when `who` is absent). */
  initial?: string;
  /** 0–1 interrogation pressure — warms the portrait shadow toward oxblood. */
  pressure?: number;
  /** Selected state. */
  active?: boolean;
  /** Caught-in-a-lie state (oxblood edge). */
  pressured?: boolean;
  /** Corner flag glyph (e.g. a crimson ✦). */
  flag?: React.ReactNode;
  onSelect?: () => void;
}

/**
 * A booking card for the witness rail.
 *
 * @startingPoint section="Roster" subtitle="Witness booking card with split-lit portrait" viewport="700x180"
 */
export function SuspectCard(props: SuspectCardProps): JSX.Element;
