import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour role. @default "neutral" */
  tone?: "neutral" | "brass" | "grounded" | "contradicted" | "silent" | "azure";
  /** Optional leading glyph. */
  glyph?: React.ReactNode;
  children?: React.ReactNode;
}

/** A small stencil status chip — doc kinds, trace tags, live/offline state. */
export function Badge(props: BadgeProps): JSX.Element;
