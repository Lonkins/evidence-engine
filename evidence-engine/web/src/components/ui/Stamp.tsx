import type { CSSProperties } from "react";
import "./stamp.css";

export type StampTone = "verified" | "contradicted" | "silent" | "gold";

interface StampProps {
  tone: StampTone;
  children: string;
  /** Large variant for set-piece moments (accusation verdict). */
  large?: boolean;
  animate?: boolean;
}

/**
 * A small deterministic jitter from the stamp's own text, so no two stamps land
 * at the same angle (a hand-stamped, not grid-generated, feel). Deterministic so
 * the same verdict always reads the same across renders.
 */
function rotationJitter(seed: string, base: number, spread: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const unit = (Math.abs(hash) % 1000) / 1000; // 0..1
  return base + (unit - 0.5) * 2 * spread; // base ± spread
}

/** An ink-stamp impression — the game's verdict language. */
export function Stamp({ tone, children, large = false, animate = true }: StampProps) {
  const style = {
    "--stamp-rot": `${rotationJitter(children, -2.5, 1.6).toFixed(2)}deg`,
    "--stamp-rot-large": `${rotationJitter(children, -4, 1.8).toFixed(2)}deg`,
  } as CSSProperties;

  return (
    <span
      className={[
        "stamp",
        `stamp--${tone}`,
        large ? "stamp--large" : "",
        animate ? "stamp--animate" : "",
      ].join(" ")}
      style={style}
      role="status"
    >
      {children}
    </span>
  );
}
