import fs from "node:fs/promises";
import { getRunsDir } from "~~/server/utils/qanaryPaths";
import type { RunSummary } from "~/types/qanary";
import path from "node:path";

const readJson = async <T>(filePath: string) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
};

export default defineEventHandler(async (event) => {
  const runsDir = getRunsDir();

  await fs.mkdir(runsDir, { recursive: true });

  const entries = await fs.readdir(runsDir, { withFileTypes: true });
  const runFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const runs: RunSummary[] = [];

  for (const folder of runFolders) {
    const summaryPath = path.join(runsDir, folder, "summary.json");

    try {
      const summary = await readJson<RunSummary>(summaryPath);
      runs.push(summary);
    } catch (error) {
      console.error(`Failed to read summary for run ${folder}:`, error);
    }
  }

  runs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return { runs };
});
