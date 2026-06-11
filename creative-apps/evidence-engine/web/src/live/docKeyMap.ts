import { DOC_INDEX } from "../data/caseData";

/**
 * The live index keys documents as `gallery-NN`; the static corpus (and the
 * DocumentModal) key them by filename (`NN-slug.md`). Map between the two so
 * live citations open the same paper as Case File mode.
 */
export function liveDocKeyToCorpusKey(liveKey: string): string | null {
  const match = liveKey.match(/^gallery-0*(\d+)$/);
  if (!match) return null;
  const prefix = match[1].padStart(2, "0");
  const meta = DOC_INDEX.find((doc) => doc.docKey.startsWith(`${prefix}-`));
  return meta?.docKey ?? null;
}
