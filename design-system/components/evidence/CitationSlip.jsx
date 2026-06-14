import React from "react";

/**
 * CitationSlip — a cited passage as a pinned paper exhibit. Aged stock with a
 * halftone dot screen, a pushpin, the document title in stencil caps, and the
 * verbatim quote. This is the "receipt": the proof, not the assertion.
 */
export function CitationSlip({
  docTitle,
  kind,
  quote,
  onOpen,
  className = "",
  ...rest
}) {
  const cls = ["ee-slip", className].filter(Boolean).join(" ");
  const Tag = onOpen ? "button" : "div";
  return (
    <Tag
      className={cls}
      onClick={onOpen}
      type={onOpen ? "button" : undefined}
      {...rest}
    >
      <span className="ee-slip__doc">
        <span className="ee-slip__pin" aria-hidden="true" />
        {docTitle}
        {kind ? <span className="ee-slip__kind">{kind}</span> : null}
      </span>
      <blockquote className="ee-slip__quote">{quote}</blockquote>
    </Tag>
  );
}
