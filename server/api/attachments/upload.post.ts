import fs from "node:fs/promises";
import path from "node:path";
import { getRunsDir } from "~~/server/utils/qanaryPaths";
import formidable from "formidable";

export default defineEventHandler(async (event) => {
  const runsDir = getRunsDir();

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(
          createError({
            statusCode: 500,
            statusMessage: "Failed to parse form data",
          }),
        );
        return;
      }

      const runId = Array.isArray(fields.runId)
        ? fields.runId[0]
        : fields.runId;
      if (!runId) {
        reject(
          createError({
            statusCode: 400,
            statusMessage: "Missing runId",
          }),
        );
        return;
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        reject(
          createError({
            statusCode: 400,
            statusMessage: "Missing file",
          }),
        );
        return;
      }

      const originalName = file.originalFilename || "unknown";
      const targetDir = path.join(runsDir, runId, "attachments");
      await fs.mkdir(targetDir, { recursive: true });

      const targetPath = path.join(targetDir, originalName);

      console.log(`[Qanary Server] Saving attachment to: ${targetPath}`);

      try {
        await fs.copyFile(file.filepath, targetPath);
        await fs.unlink(file.filepath); // Clean up temp file

        console.log(
          `[Qanary Server] Attachment saved successfully: ${originalName}`,
        );

        resolve({
          success: true,
          filename: originalName,
          url: `/api/attachments/${runId}/${originalName}`,
        });
      } catch (copyErr) {
        reject(
          createError({
            statusCode: 500,
            statusMessage: "Failed to save attachment",
          }),
        );
      }
    });
  });
});
