# Qanary 🐤

**Qanary** is a premium, high-end test reporting framework designed to surpass traditional tools like Allure. It
provides a modern, glassmorphism-inspired UI/UX and is specifically optimized for Nuxt applications using **Playwright**
for frontend and **Jest/Vitest** for API testing.

---

## 🌟 Key Features

- **Live Merged Reporting**: Seamlessly combine Frontend (Playwright) and API (Jest) test results into a single, unified
  dashboard.
- **Premium UI/UX**: A sophisticated, developer-centric interface with glassmorphism effects, smooth animations, and
  high information density.
- **Hierarchical Organization**: Tests are grouped by Parent Suite → File → Suite → Test Case for easy navigation.
- **Visual Attachments**: Direct support for screenshots, videos, and trace files with optimized streaming.
- **Stability Tracking**: Integrated Test History and Retry deep-dives to identify flaky tests and regressions.
- **Standalone Server**: Lightweight CLI to run your own reporting instance anywhere.

---

## 🚀 Quick Start

### 1. Install the Server

Install Qanary globally to use the CLI:

```bash
npm install -g qanary
```

### 2. Start the Reporting Instance

Launch the dashboard server. By default, it looks for results in the `.qanary` directory.

```bash
qanary --port 5121 --dir .qanary-results
```

---

## 🔌 Integration

### Playwright

Install the Playwright reporter:
`npm install @qanary/playwright-reporter --save-dev`

Update your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['@qanary/playwright-reporter', {
      apiUrl: 'http://localhost:5121/api/runs/push',
      project: 'my-web-app'
    }]
  ],
});
```

### Jest / Vitest

Install the Jest reporter:
`npm install @qanary/jest-reporter --save-dev`

Update your `jest.config.js`:

```javascript
module.exports = {
  reporters: [
    'default',
    ['@qanary/jest-reporter', {
      endpoint: 'http://localhost:5121/api/runs/push'
    }]
  ],
};
```

---

## 🛠️ CLI Options

| Option   | Alias | Description                         | Default   |
|:---------|:------|:------------------------------------|:----------|
| `--port` | `-p`  | Port to run the server on           | `3000`    |
| `--dir`  | `-d`  | Directory for results & attachments | `.qanary` |
| `--help` | `-h`  | Show help information               | -         |

---

## 🧪 Development

If you want to contribute or run from source:

1. **Setup**: `bun install`
2. **Dev Server**: `bun run dev`
3. **Build**: `bun run build`
4. **Typecheck**: `bun run typecheck`

---

Built with ❤️ for modern testing teams.
