import fs from "node:fs/promises";
import path from "node:path";
import { getRunsDir } from "~~/server/utils/qanaryPaths";
import type { RunDetail, RunSummary, TestCase } from "~/types/qanary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const runsDir = getRunsDir();

  // Basic validation
  if (!body.repo || !body.tests) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: repo, tests",
    });
  }

  const runId = body.id || `run-${Date.now()}`;
  const runPath = path.join(runsDir, runId);
  await fs.mkdir(runPath, { recursive: true });

  const summaryPath = path.join(runPath, "summary.json");
  const detailPath = path.join(runPath, "detail.json");
  const attachmentsDir = path.join(runPath, "attachments");
  await fs.mkdir(attachmentsDir, { recursive: true });

  let existingDetail: RunDetail | null = null;
  try {
    const raw = await fs.readFile(detailPath, "utf8");
    existingDetail = JSON.parse(raw) as RunDetail;
  } catch (e) {
    // New run
  }

  const incomingTests: TestCase[] = body.tests;
  let mergedTests = incomingTests;

  if (existingDetail) {
    // Merge tests: update existing or add new
    const testMap = new Map(existingDetail.tests.map((t) => [t.id, t]));
    for (const test of incomingTests) {
      testMap.set(test.id, test);
    }
    mergedTests = Array.from(testMap.values());
  }

  // Process attachments
  const processedTests = mergedTests.map((test) => {
    if (test.attachments) {
      test.attachments = test.attachments.map((att) => {
        if (att.url && !att.url.startsWith("http") && att.url !== "#") {
          // If it's a local filename, rewrite to our API serving endpoint
          return {
            ...att,
            url: `/api/attachments/${runId}/${att.url}`,
          };
        }
        return att;
      });
    }
    return test;
  });

  const totals = {
    passed: processedTests.filter((t: TestCase) => t.outcome === "passed")
      .length,
    failed: processedTests.filter((t: TestCase) => t.outcome === "failed")
      .length,
    skipped: processedTests.filter((t: TestCase) => t.outcome === "skipped")
      .length,
    total: processedTests.length,
    flaky: 0,
  };

  const outcome = totals.failed > 0 ? "failed" : "passed";
  const sources = [...new Set(processedTests.map((t: TestCase) => t.source))];

  // Determine mergeStatus
  // For now, let's assume if we have both playwright and jest, it's complete.
  // In a real scenario, this might be based on a config or expected sources list.
  const hasPlaywright = sources.includes("playwright");
  const hasJest = sources.includes("jest");
  const mergeStatus = hasPlaywright && hasJest ? "complete" : "partial";

  const summary: RunSummary = {
    id: runId,
    repo: body.repo,
    branch: body.branch || existingDetail?.branch || "unknown",
    commit: body.commit || existingDetail?.commit || "unknown",
    mergeStatus,
    outcome: outcome as any,
    updatedAt: new Date().toISOString(),
    totals,
    sources: sources as any,
  };

  const detail: RunDetail = {
    ...summary,
    durationMs: processedTests.reduce(
      (acc: number, t: TestCase) => acc + (t.durationMs || 0),
      0,
    ),
    tests: processedTests,
  };

  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  await fs.writeFile(detailPath, JSON.stringify(detail, null, 2));

  // We can also save the full detail if we had a dedicated storage for it
  // For now, our existing [id].get.ts is mostly mock-based,
  // but this shows how we'd handle the push.

  return {
    success: true,
    runId,
    message: "Run results pushed successfully",
  };
});
