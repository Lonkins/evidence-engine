import type { Config } from "./config.js";
import { timed, type TraceEntry } from "./trace.js";

const API_VERSION = "2026-05-01-preview";

export interface KbReference {
  docKey: string;
  title: string;
  rerankerScore: number;
}

export interface KbRetrieveResult {
  /** References above the fail-closed threshold. */
  references: KbReference[];
  /** Full grounding passages the KB returned (parallel to references by ref_id). */
  passages: Array<{ refId: number; title: string; content: string }>;
}

export interface TestimonyDoc {
  id: string;
  title: string;
  content: string;
  doc_type: "testimony";
  case_id: string;
  session_id: string;
  speaker: string;
  turn_no: number;
}

/** A chunk of user-supplied source material for a "bring your own trial". */
export interface CaseSourceDoc {
  id: string;
  title: string;
  content: string;
  doc_type: "evidence";
  case_id: string;
  session_id: string;
}

export class SearchClient {
  constructor(private readonly config: Config) {}

  private headers(): Record<string, string> {
    return {
      "api-key": this.config.searchAdminKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Agentic retrieval through the Foundry IQ knowledge base, scoped to a
   * partition of the single shared index via filterAddOn. Fails closed: only
   * references at or above the WP3-calibrated reranker threshold are returned.
   */
  async kbRetrieve(
    query: string,
    filterAddOn: string,
    step: string,
    thresholdOverride?: number
  ): Promise<{ data: KbRetrieveResult; entry: TraceEntry }> {
    const path = `/knowledgebases/${this.config.knowledgeBaseName}/retrieve`;
    return timed(step, "POST", `${path} [${filterAddOn}]`, async () => {
      const response = await fetch(`${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          intents: [{ type: "semantic", search: query }],
          retrievalReasoningEffort: { kind: "minimal" },
          knowledgeSourceParams: [
            {
              kind: "searchIndex",
              knowledgeSourceName: this.config.knowledgeSourceName,
              filterAddOn,
            },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`KB retrieve failed: ${response.status} — ${text.slice(0, 300)}`);
      }

      const body = (await response.json()) as {
        references?: Array<{ id: string; docKey: string; title?: string; rerankerScore?: number }>;
        response?: Array<{ content?: Array<{ type: string; text: string }> }>;
        activity?: Array<{ type: string; reasoningTokens?: number; count?: number }>;
      };

      const threshold = thresholdOverride ?? this.config.noEvidenceThreshold;
      const surviving = (body.references ?? []).filter(
        (ref) => (ref.rerankerScore ?? 0) >= threshold
      );
      const references = surviving.map((ref) => ({
        docKey: ref.docKey,
        title: ref.title ?? ref.docKey,
        rerankerScore: ref.rerankerScore ?? 0,
      }));

      // Only ground on passages whose reference survived the threshold.
      const survivingIds = new Set(surviving.map((ref) => parseInt(ref.id, 10)));
      const passages = parsePassages(body.response).filter((p) => survivingIds.has(p.refId));

      const top = references[0]?.rerankerScore;
      // Surface the KB's own agentic-reasoning activity in the engine tap —
      // this is Foundry IQ's reasoning step, reported by the service itself.
      const reasoning = (body.activity ?? []).find((a) => a.type === "agenticReasoning");
      const reasoningNote =
        reasoning?.reasoningTokens != null ? ` · IQ reasoning ${reasoning.reasoningTokens} tok` : "";
      return {
        status: response.status,
        data: { references, passages },
        detail: `${references.length} ref(s) ≥ ${threshold}${top ? `, top ${top.toFixed(2)}` : ""}${reasoningNote}`,
      };
    });
  }

  /**
   * IQ-brain reasoning call: answerSynthesis mode. The KB retrieves over the
   * given partition AND a bound model synthesises a grounded answer to the
   * instruction — so the verdict itself comes from Foundry IQ, not a local
   * regex. Requires reasoning effort `low`/`medium` and a model bound to the
   * KB (design-log Entry 4 provisioning spike).
   *
   * ✅ Confirmed live by spike/08-answer-synthesis.sh (June 13 2026): with
   * gpt-4.1-mini bound to evidence-kb, this exact body (`messages` +
   * `retrievalReasoningEffort` medium + `knowledgeSourceParams.filterAddOn`)
   * returns HTTP 200 with the synthesised answer in `response[0].content[0].text`
   * and grounded `references[]`. activity[] also carries `modelAnswerSynthesis`
   * and `agenticReasoning` reasoning-token counts (surfaced in the engine tap).
   */
  async kbReason(
    instruction: string,
    filterAddOn: string,
    step: string,
    effort: "low" | "medium",
    thresholdOverride?: number
  ): Promise<{ data: { answer: string; references: KbReference[] }; entry: TraceEntry }> {
    const path = `/knowledgebases/${this.config.knowledgeBaseName}/retrieve`;
    return timed(step, "POST", `${path} [answerSynthesis · ${filterAddOn}]`, async () => {
      const response = await fetch(`${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          messages: [{ role: "user", content: [{ type: "text", text: instruction }] }],
          retrievalReasoningEffort: { kind: effort },
          knowledgeSourceParams: [
            {
              kind: "searchIndex",
              knowledgeSourceName: this.config.knowledgeSourceName,
              filterAddOn,
            },
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`KB reason failed: ${response.status} — ${text.slice(0, 300)}`);
      }

      const body = (await response.json()) as {
        references?: Array<{ id: string; docKey: string; title?: string; rerankerScore?: number }>;
        response?: Array<{ content?: Array<{ type: string; text: string }> }>;
        activity?: Array<{ type: string; reasoningTokens?: number; count?: number }>;
      };

      const threshold = thresholdOverride ?? this.config.claimEvidenceThreshold;
      const references = (body.references ?? [])
        .filter((ref) => (ref.rerankerScore ?? 0) >= threshold)
        .map((ref) => ({
          docKey: ref.docKey,
          title: ref.title ?? ref.docKey,
          rerankerScore: ref.rerankerScore ?? 0,
        }));

      // In answerSynthesis mode the response text is the synthesised prose
      // answer (not the extractive passage JSON).
      const answer = body.response?.[0]?.content?.find((c) => c.type === "text")?.text ?? "";
      const reasoning = (body.activity ?? []).find((a) => a.type === "agenticReasoning");
      const reasoningNote =
        reasoning?.reasoningTokens != null ? ` · IQ reasoning ${reasoning.reasoningTokens} tok` : "";

      return {
        status: response.status,
        data: { answer, references },
        detail: `${references.length} grounding ref(s), answer ${answer.length} chars${reasoningNote}`,
      };
    });
  }

  /** Lookup a single document by key (full content, all fields). */
  async lookupDoc(
    docKey: string,
    step: string
  ): Promise<{ data: Record<string, unknown> | null; entry: TraceEntry }> {
    const path = `/indexes/${this.config.indexName}/docs/${encodeURIComponent(docKey)}`;
    return timed(step, "GET", path, async () => {
      const response = await fetch(
        `${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`,
        { headers: this.headers() }
      );
      if (response.status === 404) {
        return { status: 404, data: null, detail: "not found" };
      }
      if (!response.ok) {
        throw new Error(`Doc lookup failed: ${response.status}`);
      }
      const doc = (await response.json()) as Record<string, unknown>;
      return { status: response.status, data: doc };
    });
  }

  /** Index testimony claims so they are searchable for self-consistency checks. */
  async uploadTestimony(
    docs: TestimonyDoc[],
    step: string
  ): Promise<{ data: number; entry: TraceEntry }> {
    const path = `/indexes/${this.config.indexName}/docs/index`;
    return timed(step, "POST", path, async () => {
      const response = await fetch(`${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          value: docs.map((doc) => ({ "@search.action": "mergeOrUpload", ...doc })),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Testimony upload failed: ${response.status} — ${text.slice(0, 300)}`);
      }
      return {
        status: response.status,
        data: docs.length,
        detail: `${docs.length} testimony claim(s) indexed`,
      };
    });
  }

  /**
   * Index user-supplied source chunks as the evidence partition for a
   * "bring your own trial" (Part 2). Same index, same answerSynthesis path —
   * the witness is grounded on the user's own material and Foundry IQ checks
   * claims against it.
   */
  async uploadCaseDocs(
    docs: CaseSourceDoc[],
    step: string
  ): Promise<{ data: number; entry: TraceEntry }> {
    const path = `/indexes/${this.config.indexName}/docs/index`;
    return timed(step, "POST", path, async () => {
      const response = await fetch(`${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          value: docs.map((doc) => ({ "@search.action": "mergeOrUpload", ...doc })),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Case source upload failed: ${response.status} — ${text.slice(0, 300)}`);
      }
      return {
        status: response.status,
        data: docs.length,
        detail: `${docs.length} source chunk(s) indexed`,
      };
    });
  }

  /**
   * Delete a bring-your-own evidence partition on session end so the shared
   * index stays small. Hard-guarded to `byo-` case ids so it can never touch
   * the built-in Holbrooke corpus.
   */
  async deleteCaseDocs(caseId: string): Promise<{ data: number; entry: TraceEntry }> {
    if (!caseId.startsWith("byo-")) {
      throw new Error(`Refusing to delete a non-byo evidence partition: ${caseId}`);
    }
    const searchPath = `/indexes/${this.config.indexName}/docs/search`;
    const { data: ids, entry: findEntry } = await timed<string[]>(
      "index.find(source)",
      "POST",
      `${searchPath} [byo cleanup]`,
      async () => {
        const response = await fetch(
          `${this.config.searchEndpoint}${searchPath}?api-version=${API_VERSION}`,
          {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify({
              search: "*",
              filter: `doc_type eq 'evidence' and case_id eq '${caseId.replace(/'/g, "")}'`,
              select: "id",
              top: 1000,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Source lookup failed: ${response.status}`);
        }
        const body = (await response.json()) as { value: Array<{ id: string }> };
        const found = body.value.map((doc) => doc.id);
        return { status: response.status, data: found, detail: `${found.length} doc(s)` };
      }
    );

    if (ids.length === 0) {
      return { data: 0, entry: findEntry };
    }

    const deletePath = `/indexes/${this.config.indexName}/docs/index`;
    const { entry } = await timed("index.delete(source)", "POST", deletePath, async () => {
      const response = await fetch(
        `${this.config.searchEndpoint}${deletePath}?api-version=${API_VERSION}`,
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify({
            value: ids.map((id) => ({ "@search.action": "delete", id })),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Source delete failed: ${response.status}`);
      }
      return { status: response.status, data: ids.length, detail: `${ids.length} deleted` };
    });
    return { data: ids.length, entry };
  }

  /**
   * Sweep a speaker's earlier testimony in this session (live index call).
   * The partition is tiny (one sentence per claim), so a full scan is cheap;
   * it complements the KB semantic retrieve so the self-consistency check
   * sees every earlier statement, not just the top-ranked one.
   */
  async listSessionTestimony(
    sessionId: string,
    speaker: string,
    beforeTurn: number
  ): Promise<{ data: Array<Record<string, unknown>>; entry: TraceEntry }> {
    const path = `/indexes/${this.config.indexName}/docs/search`;
    return timed("index.scan(testimony)", "POST", `${path} [speaker partition]`, async () => {
      const response = await fetch(`${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          search: "*",
          filter:
            `doc_type eq 'testimony' and session_id eq '${sessionId.replace(/'/g, "")}'` +
            ` and speaker eq '${speaker.replace(/'/g, "")}' and turn_no lt ${beforeTurn}`,
          select: "id,content,turn_no,title",
          top: 200,
        }),
      });
      if (!response.ok) {
        throw new Error(`Testimony scan failed: ${response.status}`);
      }
      const body = (await response.json()) as { value: Array<Record<string, unknown>> };
      return {
        status: response.status,
        data: body.value,
        detail: `${body.value.length} earlier statement(s)`,
      };
    });
  }

  /** Delete all testimony documents for a session so the index stays tiny. */
  async deleteSessionTestimony(
    sessionId: string
  ): Promise<{ data: number; entry: TraceEntry }> {
    const searchPath = `/indexes/${this.config.indexName}/docs/search`;
    const { data: ids, entry: findEntry } = await timed<string[]>(
      "index.find(testimony)",
      "POST",
      `${searchPath} [session cleanup]`,
      async () => {
        const response = await fetch(
          `${this.config.searchEndpoint}${searchPath}?api-version=${API_VERSION}`,
          {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify({
              search: "*",
              filter: `doc_type eq 'testimony' and session_id eq '${sessionId.replace(/'/g, "")}'`,
              select: "id",
              top: 1000,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Testimony lookup failed: ${response.status}`);
        }
        const body = (await response.json()) as { value: Array<{ id: string }> };
        const found = body.value.map((doc) => doc.id);
        return { status: response.status, data: found, detail: `${found.length} doc(s)` };
      }
    );

    if (ids.length === 0) {
      return { data: 0, entry: findEntry };
    }

    const deletePath = `/indexes/${this.config.indexName}/docs/index`;
    const { entry } = await timed(
      "index.delete(testimony)",
      "POST",
      deletePath,
      async () => {
        const response = await fetch(
          `${this.config.searchEndpoint}${deletePath}?api-version=${API_VERSION}`,
          {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify({
              value: ids.map((id) => ({ "@search.action": "delete", id })),
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Testimony delete failed: ${response.status}`);
        }
        return { status: response.status, data: ids.length, detail: `${ids.length} deleted` };
      }
    );
    return { data: ids.length, entry };
  }

  /** Lightweight reachability probe for /api/health. */
  async ping(): Promise<{ data: boolean; entry: TraceEntry }> {
    const path = `/indexes/${this.config.indexName}/docs/$count`;
    return timed("kb.ping", "GET", path, async () => {
      const response = await fetch(
        `${this.config.searchEndpoint}${path}?api-version=${API_VERSION}`,
        { headers: this.headers() }
      );
      return { status: response.status, data: response.ok };
    });
  }
}

function parsePassages(
  response: Array<{ content?: Array<{ type: string; text: string }> }> | undefined
): Array<{ refId: number; title: string; content: string }> {
  const text = response?.[0]?.content?.find((c) => c.type === "text")?.text;
  if (!text) return [];
  try {
    const parsed = JSON.parse(text) as Array<{ ref_id: number; title?: string; content?: string }>;
    return parsed.map((p) => ({
      refId: p.ref_id,
      title: p.title ?? "",
      content: p.content ?? "",
    }));
  } catch {
    return [];
  }
}
