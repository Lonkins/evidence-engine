import { useEffect, useMemo, useRef } from "react";
import { getDocument } from "../../data/corpus";
import { DOC_META_BY_KEY } from "../../data/caseData";
import { renderMarkdown } from "../../engine/markdown";
import "./evidence.css";

interface DocumentModalProps {
  docKey: string;
  onClose: () => void;
}

/** A case document, read full-page on aged paper. */
export function DocumentModal({ docKey, onClose }: DocumentModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const meta = DOC_META_BY_KEY[docKey];
  const html = useMemo(() => {
    const source = getDocument(docKey);
    return source ? renderMarkdown(source) : null;
  }, [docKey]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="doc-modal" role="dialog" aria-modal="true" aria-label={meta?.title ?? docKey}>
      <div className="doc-modal__backdrop" onClick={onClose} />
      <article className="doc-modal__paper">
        <header className="doc-modal__bar">
          <span className="doc-modal__exhibit">
            Exhibit · {docKey} · {meta?.kind ?? "document"}
          </span>
          <button ref={closeRef} className="doc-modal__close" onClick={onClose}>
            Close ✕
          </button>
        </header>
        {html ? (
          <div className="doc-modal__body" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="doc-modal__missing">This document is not in the case file.</p>
        )}
      </article>
    </div>
  );
}
