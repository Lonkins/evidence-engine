import React from "react";

/**
 * Badge — a small stencil status chip. Quieter than a Stamp; used inline for
 * doc kinds, trace-origin tags (AZURE / MODEL / LOCAL), and live/offline state.
 */
export function Badge({
  tone = "neutral",
  glyph,
  className = "",
  children,
  ...rest
}) {
  const cls = ["ee-badge", `ee-badge--${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} {...rest}>
      {glyph ? (
        <span className="ee-badge__glyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      {children}
    </span>
  );
}
