import React from "react";

const ORIGIN_LABEL = { azure: "AZURE", model: "MODEL", local: "LOCAL" };

function stepGlyph(step = "") {
  if (step.startsWith("kb.retrieve")) return "◉";
  if (step.startsWith("index.upload")) return "▲";
  if (step.startsWith("index.lookup")) return "▣";
  if (step.startsWith("index.scan")) return "≡";
  if (step.startsWith("index.delete") || step.startsWith("index.find")) return "✕";
  if (step.startsWith("llm")) return "✎";
  return "·";
}

/**
 * TraceLine — one line of the engine wiretap: a glyph, an origin tag
 * (AZURE live Foundry IQ / MODEL witness turn / LOCAL deterministic check),
 * the step, and its method · latency · status. The IQ layer made visible.
 */
export function TraceLine({
  step,
  origin = "azure",
  method = "POST",
  latencyMs,
  status = 200,
  detail,
  target,
  className = "",
  ...rest
}) {
  const isError = status >= 400;
  const cls = ["ee-trace", isError ? "ee-trace--error" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <li className={cls} {...rest}>
      <span className="ee-trace__glyph" aria-hidden="true">{stepGlyph(step)}</span>
      <span className="ee-trace__step">
        <span className={`ee-trace__origin ee-trace__origin--${origin}`}>
          {ORIGIN_LABEL[origin] || origin}
        </span>
        {step}
      </span>
      <span className="ee-trace__meta">
        {method} · {latencyMs}ms · {status}
      </span>
      {detail ? <span className="ee-trace__detail">{detail}</span> : null}
      {target ? <span className="ee-trace__target">{target}</span> : null}
    </li>
  );
}
