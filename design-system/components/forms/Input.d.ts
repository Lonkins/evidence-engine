import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  /** Stencil label above the field. */
  label?: React.ReactNode;
  /** Typewriter hint below the field. */
  hint?: React.ReactNode;
  /** Render a single line or a multiline textarea. @default "input" */
  as?: "input" | "textarea";
}

/**
 * A case-file form line — stencil label, typewriter value, brass focus.
 *
 * @startingPoint section="Forms" subtitle="Case-file text field & intake textarea" viewport="700x200"
 */
export function Input(props: InputProps): JSX.Element;
