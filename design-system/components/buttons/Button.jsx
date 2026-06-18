import React from "react";

/**
 * Button — the brass control. Primary is the lit lamp (a brass gradient with
 * black ink); secondary is a ghost hairline; danger is oxblood, reserved for
 * the accusation. An optional `glyph` sits before the label like a stamped mark.
 */
export function Button({
  variant = "primary",
  size = "md",
  glyph,
  disabled = false,
  type = "button",
  href,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "ee-btn",
    `ee-btn--${variant}`,
    `ee-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {glyph ? (
        <span className="ee-btn__glyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <span className="ee-btn__label">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
