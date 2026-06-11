import "./stamp.css";

export type StampTone = "verified" | "contradicted" | "silent" | "gold";

interface StampProps {
  tone: StampTone;
  children: string;
  /** Large variant for set-piece moments (accusation verdict). */
  large?: boolean;
  animate?: boolean;
}

/** An ink-stamp impression — the game's verdict language. */
export function Stamp({ tone, children, large = false, animate = true }: StampProps) {
  return (
    <span
      className={[
        "stamp",
        `stamp--${tone}`,
        large ? "stamp--large" : "",
        animate ? "stamp--animate" : "",
      ].join(" ")}
      role="status"
    >
      {children}
    </span>
  );
}
