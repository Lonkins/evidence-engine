import type { ArchiveHit, ArchiveResult } from "./types";

const MIN_TERM_LENGTH = 4;
const MAX_HITS = 3;
const EXCERPT_RADIUS = 160;

const STOP_WORDS = new Set([
  "what",
  "when",
  "where",
  "which",
  "does",
  "did",
  "have",
  "that",
  "this",
  "with",
  "about",
  "from",
  "they",
  "their",
  "there",
  "were",
  "been",
  "would",
  "could",
  "should",
  "evening",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length >= MIN_TERM_LENGTH && !STOP_WORDS.has(t));
}

const MIN_SCORE = 0.3;

/**
 * Term-overlap retrieval over the case corpus, evolved from the MCP server's
 * local mode (foundry-client.ts) with inverse-document-frequency weighting:
 * words that appear across the whole case file ("gallery", "Victor") barely
 * count, so a query whose distinctive terms are absent fails closed instead
 * of matching everything weakly.
 */
export function searchArchive(
  query: string,
  corpus: Record<string, string>
): ArchiveResult {
  const terms = tokenize(query);
  if (terms.length === 0) {
    return { query, hits: [] };
  }

  const docs = Object.entries(corpus).map(([docKey, content]) => ({
    docKey,
    content,
    lower: content.toLowerCase(),
  }));
  const docCount = docs.length;

  const idf = new Map<string, number>(
    terms.map((term) => {
      const df = docs.filter((doc) => doc.lower.includes(term)).length;
      // Smoothed IDF; absent-everywhere terms get maximum weight so they
      // pull the score toward silence.
      const weight = df === 0 ? Math.log(docCount + 1) : Math.log((docCount + 1) / df);
      return [term, weight];
    })
  );
  const totalWeight = terms.reduce((sum, term) => sum + (idf.get(term) ?? 0), 0);

  const hits: ArchiveHit[] = docs
    .map((doc) => {
      const matched = terms.filter((term) => doc.lower.includes(term));
      const matchedWeight = matched.reduce((sum, term) => sum + (idf.get(term) ?? 0), 0);
      const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;
      return { docKey: doc.docKey, excerpt: buildExcerpt(doc.content, matched), score };
    })
    .filter((hit) => hit.score > MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HITS);

  return { query, hits };
}

/** Pull a readable window around the first matched term. */
function buildExcerpt(content: string, matchedTerms: string[]): string {
  if (matchedTerms.length === 0) return content.slice(0, EXCERPT_RADIUS);
  const lower = content.toLowerCase();
  const firstIndex = Math.min(
    ...matchedTerms
      .map((term) => lower.indexOf(term))
      .filter((index) => index >= 0)
  );
  const start = Math.max(0, firstIndex - EXCERPT_RADIUS / 2);
  const end = Math.min(content.length, firstIndex + EXCERPT_RADIUS * 1.5);
  const raw = content.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${raw}${end < content.length ? "…" : ""}`;
}
