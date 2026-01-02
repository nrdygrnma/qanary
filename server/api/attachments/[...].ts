import { defineEventHandler, serveStatic } from "h3";
import { join } from "node:path";
import { getRunsDir } from "~~/server/utils/qanaryPaths";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  const runsDir = getRunsDir();
  const urlPath = event.path || "";

  // Expected URL pattern: /api/attachments/:runId/:filename
  // We use a more robust regex that ignores query parameters
  const match = urlPath.match(/\/api\/attachments\/([^\/?#]+)\/([^?#]+)/);

  if (!match) return;

  const [, runId, filename] = match;
  // Decode URI components in case of spaces/special chars in filename
  const decodedFilename = decodeURIComponent(filename);
  const filePath = join(runsDir, runId, "attachments", decodedFilename);

  if (!fs.existsSync(filePath)) {
    console.warn(`[Qanary Server] Attachment not found at: ${filePath}`);
    throw createError({
      statusCode: 404,
      statusMessage: "Attachment not found",
    });
  }

  return serveStatic(event, {
    getContents: () => fs.readFileSync(filePath),
    getMeta: () => {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        mtime: stats.mtimeMs,
      };
    },
  });
});
