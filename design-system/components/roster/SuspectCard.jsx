import React from "react";
import { SuspectPortrait } from "./SuspectPortrait.jsx";

/**
 * SuspectCard — a booking card for the witness rail: split-lit mug, name,
 * role in stencil caps, and a one-line hook. Lit along the top edge, deep ink
 * beneath. Goes `active` when selected and `pressured` once caught in a lie.
 */
export function SuspectCard({
  name,
  role,
  hook,
  who,
  initial,
  pressure = 0,
  active = false,
  pressured = false,
  flag,
  onSelect,
  className = "",
  ...rest
}) {
  const cls = [
    "ee-suspect",
    active ? "ee-suspect--active" : "",
    pressured ? "ee-suspect--pressured" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} onClick={onSelect} {...rest}>
      <span className="ee-suspect__portrait">
        <SuspectPortrait who={who} initial={initial} pressure={pressure} />
        {flag ? <span className="ee-suspect__flag" aria-hidden="true">{flag}</span> : null}
      </span>
      <span className="ee-suspect__id">
        <span className="ee-suspect__name">{name}</span>
        {role ? <span className="ee-suspect__role">{role}</span> : null}
        {hook ? <span className="ee-suspect__hook">{hook}</span> : null}
      </span>
    </button>
  );
}
