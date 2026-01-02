import type { RunSummary } from "@/types/qanary";

export const useRuns = () =>
  useFetch<{ runs: RunSummary[] }>("/api/runs", {
    key: "runs",
    default: () => ({ runs: [] }),
  });
