#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple CLI handling
const args = process.argv.slice(2);
let port = process.env.PORT || "5121";
let dataDir = process.env.QANARY_DATA_DIR || ".qanary";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" || args[i] === "-p") {
    port = args[++i];
  } else if (args[i] === "--dir" || args[i] === "-d") {
    dataDir = args[++i];
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Qanary - Premium Test Reporting Server

Usage:
  qanary [options]

Options:
  --port, -p <number>  Port to run the server on (default: 5121)
  --dir, -d <path>     Directory to store test results (default: .qanary)
  --help, -h           Show this help message
    `);
    process.exit(0);
  }
}

console.log(`[Qanary] Starting reporting server...`);
console.log(`[Qanary] Data directory: ${dataDir}`);
console.log(`[Qanary] URL: http://localhost:${port}`);

// Determine if we are running from source or from installed package
let serverPath = join(__dirname, "../.output/server/index.mjs");

if (!fs.existsSync(serverPath)) {
  // If .output doesn't exist, we might be in dev mode or not built
  console.log(
    "[Qanary] Production build not found. Attempting to run in dev mode...",
  );
  serverPath = "nuxt"; // Use npx nuxt dev

  const child = spawn("npx", ["nuxt", "dev", "--port", port], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PORT: port,
      QANARY_DATA_DIR: dataDir,
      NUXT_PORT: port,
    },
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
} else {
  // Run the built server
  const child = spawn("node", [serverPath], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PORT: port,
      QANARY_DATA_DIR: dataDir,
      NITRO_PORT: port,
    },
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}
