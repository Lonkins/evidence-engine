import { useState, type FormEvent } from "react";
import { useGame } from "../../GameContext";
import { searchArchive } from "../../engine/retrieval";
import { CORPUS } from "../../data/corpus";
import { DOC_META_BY_KEY } from "../../data/caseData";
import "./evidence.css";

/**
 * Free-text consultation of the evidence file. Hits pin their documents to
 * the board; a miss is the designed fail-closed moment — a NO RECORD plate,
 * not an error.
 */
export function ArchiveSearch() {
  const { state, dispatch } = useGame();
  const [query, setQuery] = useState("");
  const latest = state.archiveLog[0] ?? null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    dispatch({ type: "ARCHIVE_SEARCH", result: searchArchive(trimmed, CORPUS) });
    setQuery("");
  };

  return (
    <section className="archive" aria-label="Consult the evidence file">
      <p className="micro-label evidence__label">Consult the archive</p>
      <form className="archive__form" onSubmit={submit}>
        <input
          className="archive__input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask the evidence file anything…"
          aria-label="Search the evidence file"
        />
        <button className="archive__go" type="submit" aria-label="Search">
          ⌕
        </button>
      </form>

      {latest && latest.hits.length === 0 && (
        <div className="archive__silent" role="status">
          <p className="archive__silent-stamp">No record</p>
          <p className="archive__silent-line">
            The evidence is silent on this point.
          </p>
          <p className="archive__silent-sub">
            “{latest.query}” surfaces nothing in the case file. That is not an
            error — it is the engine refusing to invent.
          </p>
        </div>
      )}

      {latest && latest.hits.length > 0 && (
        <ul className="archive__hits">
          {latest.hits.map((hit) => (
            <li key={hit.docKey} className="archive__hit">
              <span className="archive__hit-doc">
                {DOC_META_BY_KEY[hit.docKey]?.title ?? hit.docKey}
                <span className="archive__hit-score">
                  match {(hit.score * 100).toFixed(0)}%
                </span>
              </span>
              <span className="archive__hit-excerpt">{hit.excerpt}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
