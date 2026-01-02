/**
 * Qanary Demo Push Script
 * This script demonstrates how to push test results to the Qanary server
 * and how the merging logic works for Playwright and Jest.
 */

async function pushResults(runId, source, tests) {
  console.log(`Pushing ${tests.length} ${source} tests for run ${runId}...`);

  const response = await fetch("http://localhost:3000/api/runs/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: runId,
      repo: "qanary-demo-app",
      branch: "main",
      commit: "e8f3a2b1c9d8e7f6a5b4",
      tests: tests.map((t, i) => ({
        id: `${source}-${i}`,
        source: source,
        ...t,
      })),
    }),
  });

  const result = await response.json();
  console.log("Server response:", result);
}

const RUN_ID = `demo-${Date.now()}`;

async function main() {
  // 1. Simulate Playwright (Frontend) Results
  await pushResults(RUN_ID, "playwright", [
    {
      title: "User can login",
      outcome: "passed",
      durationMs: 1200,
      suite: "Auth",
      file: "auth.spec.ts",
      parentSuite: "Frontend",
    },
    {
      title: "Checkout process",
      outcome: "failed",
      durationMs: 5400,
      suite: "Shop",
      file: "checkout.spec.ts",
      parentSuite: "Frontend",
      error: { message: "Element not found: .checkout-btn" },
    },
  ]);

  console.log("--- Waiting 3 seconds before merging Jest results ---");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 2. Simulate Jest (API) Results
  await pushResults(RUN_ID, "jest", [
    {
      title: "GET /api/products",
      outcome: "passed",
      durationMs: 45,
      suite: "Products",
      file: "products.test.ts",
      parentSuite: "API",
    },
    {
      title: "POST /api/order",
      outcome: "passed",
      durationMs: 89,
      suite: "Orders",
      file: "orders.test.ts",
      parentSuite: "API",
    },
  ]);

  console.log(
    "\nDemo complete! Check the Qanary dashboard at http://localhost:3000",
  );
}

main().catch(console.error);
