import React from "react";

/**
 * Stamp — the inked verdict impression. The signature gesture of the system:
 * a rotated, slightly-jittered rubber stamp punched onto the evidence. Tone
 * maps to the verdict palette (grounded / contradicted / silent / brass).
 */
export function Stamp({
  tone = "contradicted",
  size = "md",
  rotate,
  animated = true,
  className = "",
  children,
  ...rest
}) {
  const style = {};
  if (rotate !== undefined && rotate !== null) {
    style["--stamp-rot"] = `${rotate}deg`;
  }
  const cls = [
    "ee-stamp",
    `ee-stamp--${tone}`,
    `ee-stamp--${size}`,
    animated ? "ee-stamp--animated" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} style={style} {...rest}>
      {children}
    </span>
  );
}
