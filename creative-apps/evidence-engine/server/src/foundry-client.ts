import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RetrievalResult {
  output: string;
  references: Array<{
    docKey: string;
    excerpt: string;
    score?: number;
  }>;
  usingLocalFallback: boolean;
}

const AZURE_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const AZURE_KEY = process.env.AZURE_SEARCH_KEY;
const AZURE_KB_NAME = process.env.AZURE_KNOWLEDGE_BASE_NAME ?? "evidence-kb";
const AZURE_INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME ?? "evidence";

export function isFoundryConfigured(): boolean {
  return Boolean(AZURE_ENDPOINT && AZURE_KEY);
}

export async function retrieve(query: string): Promise<RetrievalResult> {
  if (isFoundryConfigured()) {
    return retrieveFromFoundry(query);
  }
  return retrieveFromLocalCorpus(query);
}

async function retrieveFromFoundry(query: string): Promise<RetrievalResult> {
  const url = `${AZURE_ENDPOINT}/knowledgebases/${AZURE_KB_NAME}/retrieve?api-version=2026-05-01-preview`;

  const body = {
    messages: [{ role: "user", content: query }],
    retrievalReasoningEffort: "minimal",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZURE_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Foundry IQ retrieval failed: ${response.status} — ${text}`);
  }

  const data = (await response.json()) as {
    output?: string;
    results?: Array<{ content: string; references?: Array<{ docKey: string }> }>;
    references?: Array<{ docKey: string }>;
  };

  const references = (data.references ?? []).map((ref) => ({
    docKey: ref.docKey,
    excerpt: "",
  }));

  return {
    output: data.output ?? "",
    references,
    usingLocalFallback: false,
  };
}

export async function fetchDocumentByKey(docKey: string): Promise<string | null> {
  if (isFoundryConfigured()) {
    return fetchFromFoundryIndex(docKey);
  }
  return fetchFromLocalCorpus(docKey);
}

async function fetchFromFoundryIndex(docKey: string): Promise<string | null> {
  const url = `${AZURE_ENDPOINT}/indexes/${AZURE_INDEX_NAME}/docs/${encodeURIComponent(docKey)}?api-version=2026-05-01-preview`;

  const response = await fetch(url, {
    headers: { "api-key": AZURE_KEY! },
  });

  if (!response.ok) return null;
  const doc = (await response.json()) as { content?: string };
  return doc.content ?? null;
}

// --- Local corpus fallback ---

const CORPUS_PATH = join(__dirname, "..", "..", "corpus");

interface CorpusDoc {
  filename: string;
  content: string;
}

let corpusCache: CorpusDoc[] | null = null;

async function loadCorpus(): Promise<CorpusDoc[]> {
  if (corpusCache) return corpusCache;

  const { readdir } = await import("fs/promises");
  const files = (await readdir(CORPUS_PATH)).filter((f) => f.endsWith(".md") && f !== "case-manifest.md");

  corpusCache = await Promise.all(
    files.map(async (filename) => ({
      filename,
      content: await readFile(join(CORPUS_PATH, filename), "utf8"),
    }))
  );

  return corpusCache;
}

async function retrieveFromLocalCorpus(query: string): Promise<RetrievalResult> {
  const docs = await loadCorpus();
  const queryTerms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 3);

  const scored = docs.map((doc) => {
    const lower = doc.content.toLowerCase();
    const matchCount = queryTerms.filter((term) => lower.includes(term)).length;
    const score = queryTerms.length > 0 ? matchCount / queryTerms.length : 0;
    return { ...doc, score };
  });

  const topResults = scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (topResults.length === 0) {
    return {
      output: "",
      references: [],
      usingLocalFallback: true,
    };
  }

  return {
    output: topResults.map((r) => r.content.slice(0, 600)).join("\n\n---\n\n"),
    references: topResults.map((r) => ({
      docKey: r.filename,
      excerpt: r.content.slice(0, 200),
      score: r.score,
    })),
    usingLocalFallback: true,
  };
}

async function fetchFromLocalCorpus(docKey: string): Promise<string | null> {
  try {
    return await readFile(join(CORPUS_PATH, docKey), "utf8");
  } catch {
    return null;
  }
}
