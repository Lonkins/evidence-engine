import React from "react";

/**
 * Input — a single-line field dressed as a case-file form line: stencil label,
 * typewriter value, ink-well background, brass focus. Set `as="textarea"` for
 * the multiline intake (e.g. "paste your source").
 */
export function Input({
  label,
  hint,
  as = "input",
  id,
  className = "",
  ...rest
}) {
  const Field = as === "textarea" ? "textarea" : "input";
  const fieldId =
    id || (label ? `ee-f-${String(label).replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <label className={`ee-field ${className}`} htmlFor={fieldId}>
      {label ? <span className="ee-field__label">{label}</span> : null}
      <Field
        id={fieldId}
        className={`ee-field__control ee-field__control--${as}`}
        {...rest}
      />
      {hint ? <span className="ee-field__hint">{hint}</span> : null}
    </label>
  );
}
