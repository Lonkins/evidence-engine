import React from "react";

/**
 * ClaimChip — a challengeable claim inside witness testimony. Unpressed it is a
 * dashed brass underline inviting a press; once pressed it takes the verdict
 * colour (grounded / contradicted struck-through / unsupported dotted).
 */
export function ClaimChip({
  verdict,
  pressed = false,
  glyph,
  onPress,
  className = "",
  children,
  ...rest
}) {
  const state = pressed && verdict ? verdict.toLowerCase() : "unpressed";
  const cls = [
    "ee-claim",
    pressed ? "ee-claim--pressed" : "ee-claim--unpressed",
    pressed && verdict ? `ee-claim--${state}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (pressed) {
    return (
      <span className={cls} {...rest}>
        {children}
        {glyph ? (
          <span className="ee-claim__glyph" aria-hidden="true">
            {glyph}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <button type="button" className={cls} onClick={onPress} {...rest}>
      {children}
      <span className="ee-claim__press-hint" aria-hidden="true">Press ›</span>
    </button>
  );
}
