/* global React, ReactDOM, EEPortrait */
const { useState, useCallback } = React;

// ---------------------------------------------------------------------------
// Case data — The Holbrooke Gallery Affair (excerpt from the corpus)
// ---------------------------------------------------------------------------
const SUSPECTS = [
  { id: "helena", who: "curator", name: "Helena Voss", role: "Head Curator",
    hook: "Seven years at Victor's right hand. First to call the solicitors." },
  { id: "felix", who: "assessor", name: "Felix Drummond", role: "Insurance Assessor",
    hook: "Found the body. Has the cleanest timeline in the file." },
  { id: "nora", who: "collector", name: "Nora Ashton", role: "Private Collector",
    hook: "Was “in the neighbourhood.” Didn't mention stopping outside." },
];

const T = (v) => ({ t: "text", v });
const C = (claim) => ({ t: "claim", claim });

const QUESTIONS = {
  helena: [
    {
      id: "q-h1", label: "Walk me through your movements that evening.",
      segs: [
        T("It was an ordinary evening, Inspector, until it wasn't. "),
        C({ id: "ch1", glyph: "●", text: "Mr Drummond arrived shortly after five for his appraisal.", verdict: "SUPPORTED",
          note: "The badge log records Drummond entering at 17:02 on a temporary day pass. This checks out.",
          cites: [{ doc: "Electronic Access Log", kind: "technical record", quote: "17:02:08 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014)" }] }),
        T(" I showed him the collection, and "),
        C({ id: "ch2", glyph: "✕", text: "I locked the gallery at a quarter to eight and handed the key to Mr Drummond.", verdict: "CONTRADICTED",
          note: "Her signed statement repeats the 19:45 departure — but the access log records her card exiting the main door at 20:47:33, over an hour later, inside the time-of-death window (20:30–21:15).",
          cites: [
            { doc: "Witness Statement — H. Voss", kind: "statement", quote: "I locked the gallery at approximately a quarter to eight in the evening and handed the door key to Mr Drummond." },
            { doc: "Electronic Access Log", kind: "technical record", quote: "20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID" },
          ] }),
        T(" After that, "),
        C({ id: "ch3", glyph: "—", text: "I walked to the Underground and took the train home.", verdict: "UNSUPPORTED",
          note: "The evidence file is silent on this point. No travel record for Voss — Oyster, CCTV, or otherwise — appears anywhere in the file.",
          cites: [] }),
        T("”"),
      ],
    },
    {
      id: "q-h2", label: "Did you know about the provenance dispute?",
      segs: [
        T("Helena's jaw tightens. “There was no dispute. "),
        C({ id: "ch4", glyph: "—", text: "Victor never raised any concern about the Rothesay attribution with me.", verdict: "UNSUPPORTED",
          note: "A draft email was recovered, never sent. It names a concern — but not who Victor told. The file cannot confirm or deny what passed between them.",
          cites: [] }),
        T("”"),
      ],
    },
  ],
  felix: [
    {
      id: "q-f1", label: "You found the body. Tell me how.",
      segs: [
        T("“I came back for my folder around nine. The side door was on the latch. "),
        C({ id: "cf1", glyph: "●", text: "My re-entry is on the log at 21:04.", verdict: "SUPPORTED",
          note: "The access log corroborates a side-door entry under Drummond's visitor pass at 21:04:51.",
          cites: [{ doc: "Electronic Access Log", kind: "technical record", quote: "21:04:51 | CARD_ENTRY | READER_03_SIDE | HOLDER: Felix Drummond (VISITOR-014)" }] }),
        T(" Victor was already gone. I called it in straight away.”"),
      ],
    },
  ],
  nora: [
    {
      id: "q-n1", label: "What brought you to the gallery that night?",
      segs: [
        T("Nora smiles, unhurried. “I was in the neighbourhood. "),
        C({ id: "cn1", glyph: "✕", text: "I never went inside — I only passed by on the far pavement.", verdict: "CONTRADICTED",
          note: "A street-camera still places Ashton at the gallery's own entrance at 20:18, not the far pavement — and the lobby reader logs a tailgated entry seconds later.",
          cites: [
            { doc: "DI Sullivan — Case Notes", kind: "investigator notes", quote: "Still #4459: N. Ashton at main entrance, 20:18. Far pavement is across the road — she is at the door." },
          ] }),
        T("”"),
      ],
    },
  ],
};

const VERDICT_META = {
  SUPPORTED: { tone: "grounded", stamp: "Verified", cls: "supported" },
  CONTRADICTED: { tone: "contradicted", stamp: "Contradicted", cls: "contradicted" },
  UNSUPPORTED: { tone: "silent", stamp: "No record", cls: "unsupported" },
};

let traceSeq = 0;
function clockStamp() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

// ---------------------------------------------------------------------------
function TraceLine({ origin, step, method, latencyMs, status, detail, target }) {
  const glyph = step.startsWith("kb.retrieve") ? "◉"
    : step.startsWith("index.upload") ? "▲"
    : step.startsWith("llm") ? "✎"
    : step.startsWith("check") ? "≡" : "·";
  return (
    <li className={`ee-trace ${status >= 400 ? "ee-trace--error" : ""}`}>
      <span className="ee-trace__glyph" aria-hidden="true">{glyph}</span>
      <span className="ee-trace__step">
        <span className={`ee-trace__origin ee-trace__origin--${origin}`}>{origin.toUpperCase()}</span>
        {step}
      </span>
      <span className="ee-trace__meta">{method} · {latencyMs}ms · {status}</span>
      {detail && <span className="ee-trace__detail">{detail}</span>}
      {target && <span className="ee-trace__target">{target}</span>}
    </li>
  );
}

function CitationSlip({ doc, kind, quote }) {
  return (
    <div className="ee-slip">
      <span className="ee-slip__doc">
        <span className="ee-slip__pin" aria-hidden="true" />
        {doc}{kind && <span className="ee-slip__kind">{kind}</span>}
      </span>
      <blockquote className="ee-slip__quote">{quote}</blockquote>
    </div>
  );
}

function Testimony({ q, pressed, onPress }) {
  return (
    <div className="kit-testimony">
      <p className="kit-testimony__q">{q.label}</p>
      <p className="kit-testimony__a">
        {q.segs.map((s, i) => {
          if (s.t === "text") return <React.Fragment key={i}>{s.v}</React.Fragment>;
          const c = s.claim;
          const isPressed = pressed[c.id];
          if (!isPressed) {
            return (
              <button key={i} type="button" className="ee-claim ee-claim--unpressed" onClick={() => onPress(c)}>
                {c.text}<span className="ee-claim__press-hint" aria-hidden="true">Press ›</span>
              </button>
            );
          }
          return (
            <span key={i} className={`ee-claim ee-claim--pressed ee-claim--${c.verdict.toLowerCase()}`}>
              {c.text}<span className="ee-claim__glyph" aria-hidden="true">{c.glyph}</span>
            </span>
          );
        })}
      </p>
      {q.segs.filter((s) => s.t === "claim" && pressed[s.claim.id]).map((s) => {
        const c = s.claim; const m = VERDICT_META[c.verdict];
        return (
          <aside key={c.id} className={`kit-verdict kit-verdict--${m.cls}`}>
            <header className="kit-verdict__head">
              <span className={`ee-stamp ee-stamp--${m.tone} ee-stamp--sm ee-stamp--animated`} style={{ "--stamp-rot": "-4deg" }}>{m.stamp}</span>
              <p className="kit-verdict__claim">“{c.text}”</p>
            </header>
            {c.verdict === "UNSUPPORTED" ? (
              <div className="kit-verdict__silence">
                <p className="kit-verdict__silence-line">The evidence is silent on this point.</p>
                <p className="kit-verdict__note" style={{ maxWidth: "48ch", margin: "0 auto", color: "var(--text-dim)" }}>{c.note}</p>
              </div>
            ) : (
              <React.Fragment>
                <p className="kit-verdict__note">{c.note}</p>
                <ul className="kit-verdict__cites">
                  {c.cites.map((ct, j) => <li key={j}><CitationSlip {...ct} /></li>)}
                </ul>
              </React.Fragment>
            )}
          </aside>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
function App() {
  const [screen, setScreen] = useState("title");
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState({}); // suspectId -> [question]
  const [pressed, setPressed] = useState({});
  const [trace, setTrace] = useState([]);
  const [tally, setTally] = useState({ catch: 0, silent: 0, over: 0 });
  const [accuse, setAccuse] = useState(false);
  const [resolved, setResolved] = useState(null);

  const pushTrace = useCallback((entries) => {
    setTrace((prev) => [...prev, ...entries.map((e) => ({ ...e, _id: traceSeq++ }))]);
  }, []);

  const ask = (q) => {
    setThread((prev) => ({ ...prev, [selected]: [...(prev[selected] || []), q] }));
    pushTrace([
      { origin: "azure", step: "kb.retrieve(evidence)", method: "POST", latencyMs: 380 + ((Math.random() * 120) | 0), status: 200, target: "evidence-kb" },
      { origin: "model", step: "llm.witness.turn", method: "POST", latencyMs: 900 + ((Math.random() * 400) | 0), status: 200 },
      { origin: "azure", step: "index.upload(testimony)", method: "PUT", latencyMs: 70 + ((Math.random() * 40) | 0), status: 201, target: "evidence · doc_type=testimony" },
    ]);
  };

  const press = (c) => {
    if (pressed[c.id]) return;
    setPressed((p) => ({ ...p, [c.id]: true }));
    const m = VERDICT_META[c.verdict];
    pushTrace([
      { origin: "azure", step: "kb.retrieve(evidence)", method: "POST", latencyMs: 410 + ((Math.random() * 150) | 0), status: 200,
        detail: c.cites[0] ? `…${c.cites[0].quote.slice(0, 46)}` : "no passage above threshold", target: "evidence-kb · answerSynthesis" },
      { origin: "local", step: "check.crosscheck", method: "—", latencyMs: 2, status: 200, detail: `VERDICT: ${c.verdict}${c.verdict === "CONTRADICTED" ? " · receipt cited" : ""}` },
    ]);
    setTally((t) => ({
      catch: t.catch + (c.verdict === "CONTRADICTED" ? 1 : 0),
      silent: t.silent + (c.verdict === "UNSUPPORTED" ? 1 : 0),
      over: t.over + (c.verdict === "SUPPORTED" ? 1 : 0),
    }));
  };

  if (screen === "title") {
    return (
      <div className="kit-title">
        <img className="kit-title__seal" src="../../assets/logo-seal.svg" alt="Evidence Engine seal" />
        <p className="eyebrow kit-title__eyebrow">Evidence Engine · Foundry IQ</p>
        <h1 className="kit-title__h">Put an AI<br /><em>on the stand</em></h1>
        <p className="kit-title__deck">
          AI witnesses lie — confidently, fluently. Here you interrogate one. It answers in
          character and drifts; Foundry IQ checks every claim against the source and hands you
          the receipt — or says, honestly, when it can't be sure.
        </p>
        <div className="kit-scenarios">
          <div className="kit-scenario kit-scenario--byo" role="button" tabIndex={0} onClick={() => setScreen("desk")}>
            <span className="ee-badge ee-badge--brass">Bring your own</span>
            <span className="kit-scenario__title">Put your own source on the stand</span>
            <span className="kit-scenario__desc">Paste a doc, notes, a story, or code. A witness takes the stand who only knows what you pasted — catch what it invents.</span>
            <span className="kit-scenario__go">Paste a source →</span>
          </div>
          <div className="kit-scenario" role="button" tabIndex={0} onClick={() => setScreen("desk")}>
            <span className="ee-badge">No setup · ready to play</span>
            <span className="kit-scenario__title">Use our example case</span>
            <span className="kit-scenario__desc">The Holbrooke Gallery Affair — a murder, three AI witnesses, and at least one liar to catch against the record.</span>
            <span className="kit-scenario__go">Step into the interrogation →</span>
          </div>
        </div>
        <p className="meta kit-title__foot">A live AI takes the stand · Foundry IQ catches the lie with its citation · All persons fictitious</p>
      </div>
    );
  }

  const sus = SUSPECTS.find((s) => s.id === selected);
  const myThread = (selected && thread[selected]) || [];
  const askedIds = new Set(myThread.map((q) => q.id));
  const available = selected ? (QUESTIONS[selected] || []).filter((q) => !askedIds.has(q.id)) : [];
  const pressureBy = (id) => {
    const qs = QUESTIONS[id] || [];
    let total = 0, hit = 0;
    qs.forEach((q) => q.segs.forEach((s) => { if (s.t === "claim" && s.claim.verdict === "CONTRADICTED") { total++; if (pressed[s.claim.id]) hit++; } }));
    return total ? hit / total : 0;
  };

  return (
    <div className="kit-root">
      <header className="kit-header">
        <div className="kit-header__id">
          <img className="kit-header__seal" src="../../assets/logo-seal.svg" alt="" />
          <div>
            <div className="kit-header__title">The Holbrooke Gallery Affair</div>
            <p className="kit-header__sub eyebrow">Case No. 14 · Confidential</p>
          </div>
          <span className="kit-badge-live"><span className="kit-live-dot" />Live</span>
        </div>
        <dl className="kit-header__tally">
          <div className="kit-tally kit-tally--catch"><dt>Pinned</dt><dd>{tally.catch}<span className="kit-tally__of"> / 2</span></dd></div>
          <div className="kit-tally"><dt>File silent</dt><dd>{tally.silent}</dd></div>
        </dl>
        <button className="ee-btn ee-btn--danger ee-btn--md" onClick={() => setAccuse(true)}>
          <span className="ee-btn__glyph">✕</span><span className="ee-btn__label">Name the killer</span>
        </button>
      </header>

      <div className="kit-desk">
        <div className="kit-rail">
          <p className="eyebrow" style={{ paddingLeft: "4px" }}>The witnesses</p>
          {SUSPECTS.map((s) => {
            const pr = pressureBy(s.id);
            return (
              <button key={s.id} className={`ee-suspect ${selected === s.id ? "ee-suspect--active" : ""} ${pr > 0 ? "ee-suspect--pressured" : ""}`} onClick={() => setSelected(s.id)}>
                <span className="ee-suspect__portrait">
                  <EEPortrait who={s.who} pressure={pr} />
                  {pr > 0 && <span className="ee-suspect__flag" aria-hidden="true">✦</span>}
                </span>
                <span className="ee-suspect__id">
                  <span className="ee-suspect__name">{s.name}</span>
                  <span className="ee-suspect__role">{s.role}</span>
                  <span className="ee-suspect__hook">{s.hook}</span>
                </span>
              </button>
            );
          })}
          <p className="kit-rail__foot">Press any claim in their testimony. The engine retrieves, reasons, and returns the verdict — cited.</p>
        </div>

        <div className="kit-mid">
          {sus ? (
            <React.Fragment>
              <div className="kit-mid__head">
                <div>
                  <div className="kit-mid__name">{sus.name}</div>
                  <div className="kit-mid__role">{sus.role}</div>
                </div>
                <span className="ee-badge ee-badge--brass">On the stand</span>
              </div>
              <div className="kit-thread">
                {myThread.length === 0 && <p className="kit-empty">Choose a question below. {sus.name.split(" ")[0]} will answer — and may lie.</p>}
                {myThread.map((q) => <Testimony key={q.id} q={q} pressed={pressed} onPress={press} />)}
              </div>
              <div className="kit-dock">
                {available.length ? available.map((q) => (
                  <button key={q.id} className="kit-qcard" onClick={() => ask(q)}>{q.label}</button>
                )) : <p className="meta" style={{ margin: 0 }}>No further questions for this witness.</p>}
              </div>
            </React.Fragment>
          ) : (
            <div className="kit-thread"><p className="kit-empty">Select a witness from the rail to begin the interrogation.</p></div>
          )}
        </div>

        <aside className="kit-tap">
          <div>
            <p className="micro-label">Engine tap <span className="kit-live-dot" style={{ display: "inline-block" }} /></p>
            <p className="kit-tap__sub">Every step, tagged by who did the work: <b style={{ color: "var(--tap-azure)" }}>AZURE</b> = live Foundry IQ, <b style={{ color: "var(--brass-500)" }}>MODEL</b> = witness turn, <b>LOCAL</b> = deterministic cross-check.</p>
          </div>
          <p className="kit-tap__obj">Crack the witnesses: pin <strong>{Math.max(0, 2 - tally.catch)} more</strong> contradiction{2 - tally.catch === 1 ? "" : "s"} against the record.</p>
          <dl className="kit-score">
            <div className="kit-score__cell kit-score__cell--catch"><dt>Pinned</dt><dd>{tally.catch}</dd></div>
            <div className="kit-score__cell"><dt>Silent</dt><dd>{tally.silent}</dd></div>
            <div className="kit-score__cell kit-score__cell--bad"><dt>Overruled</dt><dd>{tally.over}</dd></div>
          </dl>
          <div className="kit-tap__log-wrap">
            <p className="micro-label kit-tap__loglabel">Engine trace · {trace.length} calls</p>
            <ol className="ee-trace-log">
              {trace.length === 0 && <li className="ee-trace" style={{ color: "var(--text-faint)", gridTemplateColumns: "1fr" }}>— line open, waiting for traffic —</li>}
              {trace.map((e) => <TraceLine key={e._id} {...e} />)}
            </ol>
          </div>
        </aside>
      </div>

      {accuse && (
        <div className="kit-accuse-overlay" onClick={() => { setAccuse(false); }}>
          <div className="kit-accuse" onClick={(e) => e.stopPropagation()}>
            {!resolved ? (
              <React.Fragment>
                <p className="eyebrow">The accusation</p>
                <h2 className="kit-accuse__h">Name the killer.</h2>
                <p className="kit-accuse__sub">You pinned {tally.catch} contradiction{tally.catch === 1 ? "" : "s"}. One witness lied about when they left — inside the time-of-death window.</p>
                <div className="kit-accuse__row">
                  {SUSPECTS.map((s) => (
                    <button key={s.id} className="ee-btn ee-btn--secondary ee-btn--md" onClick={() => setResolved(s.id === "helena" ? "right" : "wrong")}>{s.name}</button>
                  ))}
                </div>
              </React.Fragment>
            ) : (
              <div className="kit-accuse__verdict">
                <span className={`ee-stamp ee-stamp--${resolved === "right" ? "grounded" : "contradicted"} ee-stamp--lg ee-stamp--animated`}>
                  {resolved === "right" ? "Case Solved" : "Overruled"}
                </span>
                <p className="kit-accuse__sub" style={{ marginTop: "var(--space-4)" }}>
                  {resolved === "right"
                    ? "Helena Voss. Her card exited at 20:47 — over an hour after the quarter-to-eight she swore to, and squarely inside the window. The badge log is the receipt."
                    : "The record doesn't carry it. Re-open the file, press the claims that don't sit right, and let the engine hand you the cited contradiction."}
                </p>
                <button className="ee-btn ee-btn--primary ee-btn--md" style={{ marginTop: "var(--space-4)" }} onClick={() => { setAccuse(false); setResolved(null); }}>Back to the desk</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
