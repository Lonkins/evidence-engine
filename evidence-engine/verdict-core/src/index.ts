/**
 * @evidence-engine/verdict-core — the single source of truth for the verdict.
 *
 * One typed, tested module consumed by the live-server and the MCP server so
 * every surface tells the identical story: the Foundry IQ answer-synthesis
 * verdict leads (./iq.ts), the deterministic heuristic runs as a disclosed
 * cross-check (./heuristic.ts), and the types are shared (./types.ts). Kills the
 * three-engine drift called out in design-log Entry 4.
 */

export * from "./types.js";
export * from "./heuristic.js";
export * from "./iq.js";
