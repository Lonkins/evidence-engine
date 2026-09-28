import * as React from "react";

export interface ClaimChipProps
  extends React.HTMLAttributes<HTMLElement> {
  /** The verdict once pressed. */
  verdict?: "supported" | "contradicted" | "unsupported";
  /** Whether the claim has been pressed (verdict revealed). */
  pressed?: boolean;
  /** Trailing glyph shown after a pressed claim (e.g. ✕ ● —). */
  glyph?: React.ReactNode;
  /** Fired when an unpressed claim is pressed. */
  onPress?: () => void;
  children?: React.ReactNode;
}

/** A challengeable claim embedded in witness testimony. */
export function ClaimChip(props: ClaimChipProps): JSX.Element;
