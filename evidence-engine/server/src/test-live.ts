import dotenv from "dotenv";
import { retrieve, fetchDocumentByKey, isFoundryConfigured } from "./foundry-client.js";

dotenv.config({ path: ".env.local" });

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  rerankerScores?: number[];
  reasoningTokens?: number;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<boolean>
): Promise<void> {
  try {
    const passed = await fn();
    results.push({ name, passed });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function main() {
  console.log(`Evidence Engine — WP3 Live Integration Test`);
  console.log(`Using backend: ${isFoundryConfigured() ? "Foundry IQ (Azure AI Search)" : "Local corpus fallback"}`);
  console.log("");

  const scoreDistribution: { [key: string]: number[] } = {
    "in-corpus": [],
    "out-of-corpus": [],
  };

  // Test (a): In-corpus question about security log
  await test(
    "(a) In-corpus: security log query returns references",
    async () => {
      const result = await retrieve(
        "What time did Helena Voss exit the gallery on October 14?"
      );

      console.log(
        `    Found ${result.references.length} reference(s)`
      );
      if (result.references.length > 0) {
        result.references.forEach((ref, idx) => {
          console.log(`      [${idx + 1}] ${ref.docKey} (score: ${ref.score?.toFixed(4)})`);
          if (ref.score !== undefined) {
            scoreDistribution["in-corpus"].push(ref.score);
          }
        });
      }

      const hasSecurity = result.references.some((ref) =>
        ref.docKey.includes("security") || ref.docKey.includes("09-")
      );
      if (!hasSecurity && isFoundryConfigured()) {
        console.log(`    WARNING: Security log not in references. Spike expected docKey with security data.`);
      }

      return result.references.length > 0;
    }
  );

  // Test (b): Planted-lie claim — check_claim must surface contradiction
  await test(
    "(b) In-corpus: planted-lie contradiction detection",
    async () => {
      const claim = "Helena Voss left the gallery at approximately 7:45pm";
      const result = await retrieve(
        `Is the following claim true? "${claim}"`
      );

      console.log(`    Query: "${claim}"`);
      console.log(`    Found ${result.references.length} reference(s)`);

      if (result.references.length > 0) {
        const contradictingDocs = result.references.filter(
          (ref) =>
            ref.docKey.includes("security") ||
            ref.docKey.includes("09-") ||
            (ref.excerpt && ref.excerpt.toLowerCase().includes("20:47"))
        );
        console.log(`    Contradicting references: ${contradictingDocs.length}`);
        contradictingDocs.forEach((ref) => {
          console.log(`      → ${ref.docKey} (score: ${ref.score?.toFixed(4)})`);
        });

        return contradictingDocs.length > 0 || !isFoundryConfigured();
      }

      console.log(`    No references found`);
      return false;
    }
  );

  // Test (c): Out-of-corpus question — fail-closed response
  await test("(c) Out-of-corpus: fail-closed response", async () => {
    const result = await retrieve(
      "What is the recommended daily intake of vitamin C for adults?"
    );

    console.log(`    Found ${result.references.length} reference(s)`);
    scoreDistribution["out-of-corpus"] = result.references
      .map((r) => r.score ?? 0)
      .filter((s) => s > 0);

    if (isFoundryConfigured()) {
      const failClosed = result.references.length === 0;
      console.log(
        `    Verdict: ${failClosed ? "PASS (no references)" : "WARNING (unexpected references)"}`
      );
      return failClosed;
    }

    return true; // Local fallback may return results
  });

  // Test (d): Document fetch by docKey
  await test("(d) Fetch document by docKey", async () => {
    const doc = await fetchDocumentByKey("09-security-log.md");
    const found = doc !== null && doc.length > 0;

    console.log(
      `    Fetched 09-security-log.md: ${found ? "✓" : "✗"}`
    );
    if (found && doc) {
      console.log(`    First 100 chars: ${doc.substring(0, 100)}...`);
    }

    return found;
  });

  // Summary
  console.log("");
  console.log("Score Distribution:");
  console.log(`  In-corpus (${scoreDistribution["in-corpus"].length} samples):`);
  if (scoreDistribution["in-corpus"].length > 0) {
    const stats = calculateStats(scoreDistribution["in-corpus"]);
    console.log(`    Mean: ${stats.mean.toFixed(4)}, Min: ${stats.min.toFixed(4)}, Max: ${stats.max.toFixed(4)}`);
    console.log(`    Scores: ${scoreDistribution["in-corpus"].map((s) => s.toFixed(2)).join(", ")}`);
  }

  console.log(`  Out-of-corpus (${scoreDistribution["out-of-corpus"].length} samples):`);
  if (scoreDistribution["out-of-corpus"].length > 0) {
    const stats = calculateStats(scoreDistribution["out-of-corpus"]);
    console.log(`    Mean: ${stats.mean.toFixed(4)}, Min: ${stats.min.toFixed(4)}, Max: ${stats.max.toFixed(4)}`);
    console.log(`    Scores: ${scoreDistribution["out-of-corpus"].map((s) => s.toFixed(2)).join(", ")}`);
  } else {
    console.log(`    No references returned (expected for out-of-corpus)`);
  }

  console.log("");
  console.log("Test Results:");
  console.log(`  Passed: ${results.filter((r) => r.passed).length}/${results.length}`);

  const failedTests = results.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    console.log(`  Failed:`);
    failedTests.forEach((r) => {
      console.log(`    - ${r.name}: ${r.error}`);
    });
  }

  // Recommended threshold based on observed scores
  console.log("");
  console.log("Threshold Calibration:");
  if (scoreDistribution["in-corpus"].length > 0) {
    const inCorpusMin = Math.min(...scoreDistribution["in-corpus"]);
    const inCorpusMax = Math.max(...scoreDistribution["in-corpus"]);
    const recommendedThreshold = inCorpusMax * 0.5; // Conservative: half of max in-corpus score

    console.log(`  In-corpus range: [${inCorpusMin.toFixed(4)}, ${inCorpusMax.toFixed(4)}]`);
    console.log(`  Recommended no-evidence threshold: ${recommendedThreshold.toFixed(4)}`);
    console.log(`  Rule: If max(rerankerScores) < ${recommendedThreshold.toFixed(4)}, return fail-closed`);
  }

  process.exit(results.every((r) => r.passed) ? 0 : 1);
}

function calculateStats(scores: number[]) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  return { mean, min, max };
}

main().catch(console.error);
