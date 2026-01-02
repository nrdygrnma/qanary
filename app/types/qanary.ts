export type ContributionType = "playwright" | "jest";

export type TestStep = {
  title: string;
  outcome: "passed" | "failed" | "skipped";
  durationMs: number;
};

export type TestError = {
  message: string;
  stack?: string;
};

export type TestAttachment = {
  name: string;
  type: "image" | "video" | "text" | "other";
  url: string;
  contentType?: string;
  size?: number;
};

export type TestCase = {
  id: string;
  title: string;
  suite: string; // e.g. "Flights - FlightFormNuxt"
  file?: string; // e.g. "flights.spec.ts"
  parentSuite?: string; // e.g. "Frontend"
  source: ContributionType;
  outcome: "passed" | "failed" | "skipped";
  durationMs: number;
  steps?: TestStep[];
  error?: TestError;
  attachments?: TestAttachment[];
};

export type RunDetail = {
  id: string;
  repo: string;
  branch: string;
  commit: string;
  mergeStatus: "partial" | "complete";
  outcome: "passed" | "failed" | "running";
  updatedAt: string;
  durationMs: number;
  totals: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
  tests: TestCase[];
};

export type RunSummary = {
  id: string;
  mergeStatus: "partial" | "complete";
  outcome: "passed" | "failed" | "running";
  updatedAt: string;
  repo: string;
  branch: string;
  commit: string;
  buildId?: string;
  totals: {
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    total: number;
  };
  sources: ContributionType[];
};
