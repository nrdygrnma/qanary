import fs from "node:fs/promises";
import path from "node:path";
import { getRunsDir } from "~~/server/utils/qanaryPaths";
import type { RunDetail } from "~/types/qanary";

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") ?? "unknown");
  const runsDir = getRunsDir();

  // Try to load real data if it exists
  const detailPath = path.join(runsDir, id, "detail.json");
  try {
    const raw = await fs.readFile(detailPath, "utf8");
    return JSON.parse(raw) as RunDetail;
  } catch (e) {
    // Fallback to demo data if it's the demo run or if real data is missing
    if (id !== "demo-run") {
      // If it's not the demo and we can't find it, check if we at least have summary
      const summaryPath = path.join(runsDir, id, "summary.json");
      try {
        const raw = await fs.readFile(summaryPath, "utf8");
        const summary = JSON.parse(raw);
        // If we only have summary, we can return it with empty tests or mock tests
        return {
          ...summary,
          durationMs: summary.durationMs || 0,
          tests: [],
        } as RunDetail;
      } catch (err) {
        // Run not found
      }
    }
  }

  // Demo fallback
  return {
    id,
    repo: "qanary-demo",
    branch: "main",
    commit: "a1b2c3d4e5f6g7h8i9j0",
    mergeStatus: "complete",
    outcome: "failed",
    updatedAt: new Date().toISOString(),
    durationMs: 154000,
    totals: { total: 108, passed: 101, failed: 7, skipped: 0 },
    tests: [
      // Frontend -> flights.spec.ts -> Flights – FlightFormNuxt
      {
        id: "f-1",
        parentSuite: "Frontend",
        file: "flights.spec.ts",
        suite: "Flights – FlightFormNuxt",
        title: "can add one-way flight",
        source: "playwright",
        outcome: "failed",
        durationMs: 44658,
        history: [
          {
            runId: "run-101",
            outcome: "passed",
            durationMs: 42000,
            date: "2026-01-01T10:00:00Z",
          },
          {
            runId: "run-102",
            outcome: "passed",
            durationMs: 41500,
            date: "2026-01-01T12:00:00Z",
          },
          {
            runId: "run-103",
            outcome: "failed",
            durationMs: 45000,
            date: "2026-01-02T08:00:00Z",
          },
        ],
        retries: [
          {
            attempt: 1,
            outcome: "failed",
            durationMs: 44658,
            error: {
              message:
                "TimeoutError: locator.waitFor: Timeout 5000ms exceeded.",
              stack:
                "Error: locator.waitFor: Timeout 5000ms exceeded.\n    at flights.spec.ts:296:3",
            },
            attachments: [
              {
                name: "screenshot",
                type: "image",
                url: "https://placehold.co/800x450/red/white?text=Attempt+1+Screenshot",
                contentType: "image/png",
                size: 30720,
              },
            ],
          },
        ],
        error: {
          message: "TimeoutError: locator.waitFor: Timeout 5000ms exceeded.",
          stack:
            "Error: locator.waitFor: Timeout 5000ms exceeded.\n    at flights.spec.ts:296:3",
        },
        attachments: [
          {
            name: "screenshot",
            type: "image",
            url: "https://placehold.co/800x450/red/white?text=Timeout+Screenshot",
            contentType: "image/png",
            size: 30720,
          },
          {
            name: "video",
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            contentType: "video/mp4",
            size: 16588,
          },
          {
            name: "error-context",
            type: "text",
            url: "#",
            contentType: "text/markdown",
            size: 1945,
          },
        ],
      },
      {
        id: "f-2",
        parentSuite: "Frontend",
        file: "flights.spec.ts",
        suite: "Flights – FlightFormNuxt",
        title: "modal opens + empty submit shows validation",
        source: "playwright",
        outcome: "failed",
        durationMs: 2987,
        error: {
          message: "Validation failed: 'Departure' is required",
          stack: "Error: Validation failed\n    at flights.spec.ts:310:5",
        },
        attachments: [
          {
            name: "screenshot",
            type: "image",
            url: "https://placehold.co/800x450/red/white?text=Validation+Error",
            contentType: "image/png",
            size: 15360,
          },
        ],
      },
      {
        id: "f-3",
        parentSuite: "Frontend",
        file: "flights.spec.ts",
        suite: "Flights – FlightFormNuxt",
        title:
          "round trip: enabling adds return segment; invalid arrival shows error",
        source: "playwright",
        outcome: "failed",
        durationMs: 45007,
      },
      {
        id: "f-4",
        parentSuite: "Frontend",
        file: "flights.spec.ts",
        suite: "Flights – FlightFormNuxt",
        title: "multi-leg outbound: add leg adds segment; remove removes it",
        source: "playwright",
        outcome: "passed",
        durationMs: 34764,
        history: [
          {
            runId: "run-101",
            outcome: "failed",
            durationMs: 38000,
            date: "2026-01-01T10:00:00Z",
          },
          {
            runId: "run-102",
            outcome: "passed",
            durationMs: 35000,
            date: "2026-01-01T12:00:00Z",
          },
        ],
        retries: [
          {
            attempt: 1,
            outcome: "failed",
            durationMs: 12000,
            error: {
              message: "Unexpected dialog appearance",
              stack: "Error: Unexpected dialog\n    at flights.spec.ts:150:5",
            },
          },
        ],
        steps: [
          { title: "Before Hooks", outcome: "passed", durationMs: 8310 },
          {
            title: 'Navigate to "/trips/..."',
            outcome: "passed",
            durationMs: 1094,
          },
          {
            title: 'Expect "toBeVisible" getByText(/flights/i).first()',
            outcome: "passed",
            durationMs: 49,
          },
          {
            title: 'Wait for load state "domcontentloaded"',
            outcome: "passed",
            durationMs: 0,
          },
          {
            title: 'Wait for load state "networkidle"',
            outcome: "passed",
            durationMs: 2334,
          },
          {
            title: "Click getByTestId('add-flight-btn')",
            outcome: "passed",
            durationMs: 181,
          },
        ],
      },
      {
        id: "f-5",
        parentSuite: "Frontend",
        file: "flights.spec.ts",
        suite: "Flights – FlightFormNuxt",
        title: "can view flight details",
        source: "playwright",
        outcome: "failed",
        durationMs: 21688,
      },
      // Frontend -> carRentals.spec.ts -> Car Rentals
      {
        id: "c-1",
        parentSuite: "Frontend",
        file: "carRentals.spec.ts",
        suite: "Car Rentals",
        title: "can view car rental details",
        source: "playwright",
        outcome: "failed",
        durationMs: 8121,
      },
      {
        id: "c-2",
        parentSuite: "Frontend",
        file: "carRentals.spec.ts",
        suite: "Car Rentals",
        title: "can add car rental",
        source: "playwright",
        outcome: "failed",
        durationMs: 8123,
      },
      {
        id: "c-3",
        parentSuite: "Frontend",
        file: "carRentals.spec.ts",
        suite: "Car Rentals",
        title: "can select car rental as final",
        source: "playwright",
        outcome: "failed",
        durationMs: 8027,
      },
      // API
      {
        id: "a-1",
        parentSuite: "API",
        file: "auth.test.ts",
        suite: "Authentication",
        title: "POST /login returns token",
        source: "jest",
        outcome: "passed",
        durationMs: 150,
      },
      ...Array.from({ length: 99 }, (_, i) => ({
        id: `a-gen-${i}`,
        parentSuite: "API",
        file: "general.test.ts",
        suite: "General Checks",
        title: `check endpoint efficiency ${i + 1}`,
        source: "jest",
        outcome: "passed",
        durationMs: Math.floor(Math.random() * 500),
      })),
    ],
  };
});
