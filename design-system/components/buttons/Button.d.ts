import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual weight.
   * - `primary`   — lit-brass gradient, black ink. The case-opening CTA.
   * - `secondary` — ghost: brass text on a hairline border.
   * - `danger`    — oxblood. Reserved for the accusation / destructive acts.
   * - `quiet`     — text-only, dim. Tertiary actions.
   */
  variant?: "primary" | "secondary" | "danger" | "quiet";
  /** Size ramp. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Optional leading glyph (unicode mark), set before the label. */
  glyph?: React.ReactNode;
  /** Render as an anchor instead of a button. */
  href?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * The brass control of the interrogation desk.
 *
 * @startingPoint section="Controls" subtitle="Brass button — primary / secondary / danger" viewport="700x150"
 */
export function Button(props: ButtonProps): JSX.Element;
