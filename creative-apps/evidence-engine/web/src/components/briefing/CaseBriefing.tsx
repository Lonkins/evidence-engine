import "./briefing.css";

const FACTS: Array<[string, string]> = [
  ["Victim", "Victor Holt, 58 — gallery owner"],
  ["Cause", "Blunt force trauma, single blow"],
  ["Window", "20:30 – 21:15, 14 October 2025"],
  ["Scene", "Private office, Holbrooke Gallery, Camden"],
];

export function CaseBriefing() {
  return (
    <section className="briefing" aria-labelledby="briefing-heading">
      <p className="micro-label">Case briefing</p>
      <h2 id="briefing-heading" className="briefing__title">
        Somebody in this file is lying to you.
      </h2>
      <dl className="briefing__facts">
        {FACTS.map(([label, value]) => (
          <div key={label} className="briefing__fact">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ol className="briefing__method">
        <li>
          <strong>Interrogate.</strong> Choose a suspect from the rail. Their answers
          arrive as testimony — laced with claims.
        </li>
        <li>
          <strong>Press every claim.</strong> The engine checks it against the
          evidence file and stamps a verdict, citations attached. Documents you
          surface are pinned to the board.
        </li>
        <li>
          <strong>Accuse.</strong> When you can prove it — name them, and bring the
          documents that hold up.
        </li>
      </ol>
      <p className="briefing__warning">
        The dialogue can charm you. The citations cannot. When the file has nothing,
        the engine says so — <em>the evidence is silent</em> — and that, too, is an
        answer.
      </p>
    </section>
  );
}
