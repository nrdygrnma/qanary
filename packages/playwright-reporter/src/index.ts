import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import * as fs from "node:fs";
import * as path from "node:path";

export interface QanaryReporterOptions {
  apiUrl?: string;
  apiKey?: string;
  project?: string;
  runId?: string;
  branch?: string;
  commit?: string;
}

class QanaryReporter implements Reporter {
  private options: QanaryReporterOptions;
  private tests: any[] = [];
  private attachmentsToUpload: {
    runId?: string;
    path: string;
    filename: string;
  }[] = [];
  private config!: FullConfig;

  constructor(options: QanaryReporterOptions = {}) {
    this.options = {
      apiUrl:
        process.env.QANARY_API_URL || "http://localhost:3000/api/runs/push",
      apiKey: process.env.QANARY_API_KEY,
      project: process.env.QANARY_PROJECT || "unknown-project",
      runId: process.env.QANARY_RUN_ID,
      branch: process.env.QANARY_BRANCH || "main",
      commit: process.env.QANARY_COMMIT || "unknown",
      ...options,
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const parentSuite = test.parent.parent?.title || "Default";
    const file = path.basename(test.location.file);
    const suiteName = test.parent.title || "Root";

    const testCase: any = {
      id: `${test.id}-${result.retry}`,
      title: test.title,
      suite: suiteName,
      file: file,
      parentSuite: parentSuite,
      source: "playwright",
      outcome: this.mapStatus(result.status),
      durationMs: result.duration,
      steps: result.steps.map((step) => ({
        title: step.title,
        outcome: this.mapStatus(step.error ? "failed" : "passed"),
        durationMs: step.duration,
      })),
      attachments: [],
    };

    if (result.error) {
      testCase.error = {
        message: result.error.message || "Unknown error",
        stack: result.error.stack,
      };
    }

    // Handle attachments
    for (const attachment of result.attachments) {
      if (attachment.path) {
        const filename = path.basename(attachment.path);
        testCase.attachments.push({
          name: attachment.name,
          type: attachment.contentType?.startsWith("image/")
            ? "image"
            : attachment.contentType?.startsWith("video/")
              ? "video"
              : "other",
          url: filename, // The server will rewrite this
          contentType: attachment.contentType,
          size: fs.existsSync(attachment.path)
            ? fs.statSync(attachment.path).size
            : 0,
        });

        this.attachmentsToUpload.push({
          path: attachment.path,
          filename: filename,
        });
      }
    }

    this.tests.push(testCase);
  }

  async onEnd(result: FullResult) {
    const payload = {
      id: this.options.runId,
      repo: this.options.project,
      branch: this.options.branch,
      commit: this.options.commit,
      tests: this.tests,
    };

    console.log(
      `[Qanary] Sending ${this.tests.length} test results to ${this.options.apiUrl}...`,
    );

    try {
      const response = await fetch(this.options.apiUrl!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.options.apiKey
            ? `Bearer ${this.options.apiKey}`
            : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          `[Qanary] Failed to push results: ${response.status} ${text}`,
        );
        return;
      }

      const data: any = await response.json();
      const runId = data.runId;
      console.log(`[Qanary] Results pushed successfully. Run ID: ${runId}`);

      // Upload attachments
      const uploadUrl = new URL(this.options.apiUrl!);
      uploadUrl.pathname = uploadUrl.pathname.replace(
        /\/runs\/push$/,
        "/attachments/upload",
      );
      await this.uploadAttachments(runId, uploadUrl.toString());
    } catch (error) {
      console.error("[Qanary] Error pushing results:", error);
    }
  }

  private async uploadAttachments(runId: string, uploadUrl: string) {
    if (this.attachmentsToUpload.length === 0) return;

    console.log(
      `[Qanary] Uploading ${this.attachmentsToUpload.length} attachments to ${uploadUrl}...`,
    );

    for (const attachment of this.attachmentsToUpload) {
      if (!fs.existsSync(attachment.path)) {
        console.warn(`[Qanary] Attachment file not found: ${attachment.path}`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("runId", runId);

        const fileBuffer = fs.readFileSync(attachment.path);
        const blob = new Blob([fileBuffer]);
        formData.append("file", blob, attachment.filename);

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: this.options.apiKey
              ? `Bearer ${this.options.apiKey}`
              : "",
          },
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(
            `[Qanary] Failed to upload attachment ${attachment.filename}: ${response.status} ${text}`,
          );
        }
      } catch (error) {
        console.error(
          `[Qanary] Error uploading attachment ${attachment.filename}:`,
          error,
        );
      }
    }
  }

  private mapStatus(status: string): string {
    switch (status) {
      case "passed":
        return "passed";
      case "failed":
      case "timedOut":
        return "failed";
      case "skipped":
        return "skipped";
      default:
        return "skipped";
    }
  }
}

export default QanaryReporter;
