/**
 * Engine trace — every outbound call the backend makes on behalf of a turn is
 * recorded here and returned to the UI, so the Foundry IQ layer is visible
 * working in real time. This is also the integration proof for the demo video.
 */
export interface TraceEntry {
  /** Logical step, e.g. "kb.retrieve(evidence)", "llm.chat", "index.upload(testimony)" */
  step: string;
  method: "POST" | "GET";
  /** Sanitized target — path only, never the host or any key. */
  target: string;
  latencyMs: number;
  status: number;
  /** Small human-readable detail, e.g. "2 refs, top score 3.85". */
  detail?: string;
  /**
   * Honest pipeline labelling: which system did the work. `azure` = a live
   * Foundry IQ / Azure AI Search call; `model` = GitHub Models; `heuristic` =
   * local deterministic verdict logic running over retrieved passages. The
   * UI shows this tag so the azure-vs-local split is disclosed, not discovered.
   */
  origin: "azure" | "model" | "heuristic";
}

export type Traced<T> = { data: T; trace: TraceEntry[] };

export async function timed<T>(
  step: string,
  method: "POST" | "GET",
  target: string,
  fn: () => Promise<{ status: number; data: T; detail?: string }>,
  origin: TraceEntry["origin"] = "azure"
): Promise<{ data: T; entry: TraceEntry }> {
  const started = Date.now();
  const { status, data, detail } = await fn();
  return {
    data,
    entry: { step, method, target, latencyMs: Date.now() - started, status, detail, origin },
  };
}

/** Trace line for local deterministic work (verdict heuristics). */
export function heuristicEntry(step: string, latencyMs: number, detail: string): TraceEntry {
  return {
    step,
    method: "POST",
    target: "local — deterministic verdict logic over retrieved passages",
    latencyMs,
    status: 200,
    detail,
    origin: "heuristic",
  };
}
