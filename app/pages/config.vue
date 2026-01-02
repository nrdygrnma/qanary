<template>
  <UContainer class="py-6 space-y-6">
    <QanaryHeader subtitle="Configuration & Integration Guide" />

    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        icon="i-lucide-arrow-left"
        label="Back to Dashboard"
        variant="ghost"
        @click="navigateTo('/')"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sidebar Navigation -->
      <div class="space-y-4">
        <UCard class="sticky top-6">
          <nav class="flex flex-col gap-1">
            <UButton
              v-for="item in navItems"
              :key="item.id"
              :color="activeSection === item.id ? 'primary' : 'neutral'"
              :icon="item.icon"
              :label="item.label"
              block
              class="justify-start"
              variant="ghost"
              @click="activeSection = item.id"
            />
          </nav>
        </UCard>
      </div>

      <!-- Content Area -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Overview Section -->
        <section v-if="activeSection === 'overview'" class="space-y-4">
          <h2 class="text-2xl font-bold">Quick Start</h2>
          <p class="text-gray-600 dark:text-gray-400">
            Qanary is a premium, standalone reporting server for Playwright and
            Jest. It can be installed as a global or local dependency and run
            via its CLI.
          </p>

          <UCard class="bg-gray-900 border-gray-800">
            <template #header>
              <div class="font-bold text-gray-200">Installation & Run</div>
            </template>
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="text-xs font-bold text-gray-500 uppercase">
                  Install globally
                </div>
                <div
                  class="flex items-center justify-between bg-black p-3 rounded-lg font-mono text-sm text-green-400 border border-white/5"
                >
                  <code>npm install -g qanary</code>
                  <UButton
                    color="neutral"
                    icon="i-lucide-copy"
                    size="xs"
                    variant="ghost"
                    @click="copyToClipboard('npm install -g qanary')"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-xs font-bold text-gray-500 uppercase">
                  Run Server
                </div>
                <div
                  class="flex items-center justify-between bg-black p-3 rounded-lg font-mono text-sm text-green-400 border border-white/5"
                >
                  <code>qanary --port 5121 --dir .qanary-results</code>
                  <UButton
                    color="neutral"
                    icon="i-lucide-copy"
                    size="xs"
                    variant="ghost"
                    @click="
                      copyToClipboard(
                        'qanary --port 5121 --dir .qanary-results',
                      )
                    "
                  />
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="font-bold">Integration Architecture</div>
            </template>
            <div
              class="flex flex-col md:flex-row items-center justify-around gap-6 py-4"
            >
              <div
                class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 w-full"
              >
                <UIcon class="w-8 h-8 text-primary" name="i-lucide-monitor" />
                <span class="font-bold">Nuxt App</span>
                <span class="text-xs text-center text-gray-500"
                  >Playwright Tests</span
                >
              </div>
              <UIcon
                class="hidden md:block w-6 h-6 text-gray-300"
                name="i-lucide-arrow-right"
              />
              <div
                class="flex flex-col items-center gap-2 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800 w-full border-dashed"
              >
                <UIcon
                  class="w-8 h-8 text-primary animate-bounce"
                  name="i-lucide-upload-cloud"
                />
                <span class="font-bold">Qanary Reporter</span>
                <span class="text-xs text-center text-gray-500">HTTP Push</span>
              </div>
              <UIcon
                class="hidden md:block w-6 h-6 text-gray-300"
                name="i-lucide-arrow-right"
              />
              <div
                class="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 w-full"
              >
                <UIcon
                  class="w-8 h-8 text-primary"
                  name="i-lucide-layout-dashboard"
                />
                <span class="font-bold">Qanary Server</span>
                <span class="text-xs text-center text-gray-500"
                  >Merged Reporting</span
                >
              </div>
            </div>
          </UCard>
        </section>

        <!-- Playwright Section -->
        <section v-if="activeSection === 'playwright'" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Playwright Integration</h2>
            <UButton
              color="neutral"
              icon="i-lucide-copy"
              label="Copy Config"
              size="xs"
              variant="ghost"
              @click="
                copyToClipboard(`// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['./packages/playwright-reporter', {
      apiUrl: 'http://localhost:3000/api/runs/push',
      project: 'my-nuxt-app'
    }]
  ],
});`)
              "
            />
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Add the Qanary reporter to your `playwright.config.ts`. You can use
            the local version from this repository or install it if published.
          </p>

          <UCard :ui="{ body: 'p-0' }" class="overflow-hidden">
            <div
              class="bg-gray-900 p-4 text-xs font-mono text-gray-300 overflow-x-auto"
            >
              <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  reporter: [
    ['list'],
    ['./packages/playwright-reporter', {
      apiUrl: 'http://your-qanary-instance/api/runs/push',
      project: 'my-nuxt-app'
    }]
  ],
});</code></pre>
            </div>
          </UCard>
        </section>

        <!-- Jest Section -->
        <section v-if="activeSection === 'jest'" class="space-y-4">
          <h2 class="text-2xl font-bold">Jest / Vitest Integration</h2>
          <p class="text-gray-600 dark:text-gray-400">
            For API testing with Jest or Vitest, use our dedicated reporter in
            your configuration file.
          </p>

          <UCard :ui="{ body: 'p-0' }" class="overflow-hidden">
            <div
              class="bg-gray-900 p-4 text-xs font-mono text-gray-300 overflow-x-auto"
            >
              <pre><code>// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['@qanary/jest-reporter', {
      endpoint: 'http://your-qanary-instance/api/runs/push'
    }]
  ],
};</code></pre>
            </div>
          </UCard>
        </section>

        <!-- API Section -->
        <section v-if="activeSection === 'api'" class="space-y-4">
          <h2 class="text-2xl font-bold">Manual API Access</h2>
          <p class="text-gray-600 dark:text-gray-400">
            You can also push results manually using our REST API. This is
            useful for custom CI/CD scripts.
          </p>

          <div class="space-y-4">
            <div
              class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800"
            >
              <div class="flex items-center gap-2 mb-2">
                <UBadge color="primary">POST</UBadge>
                <code class="text-sm font-bold">/api/runs/push</code>
              </div>
              <p class="text-xs text-gray-500">
                Pushes a new test result set to the server.
              </p>
            </div>

            <UCard :ui="{ body: 'p-0' }" class="overflow-hidden">
              <div
                class="bg-gray-800 px-4 py-2 border-b border-gray-700 text-xs font-bold text-gray-400"
              >
                Request Body Example
              </div>
              <div
                class="bg-gray-900 p-4 text-xs font-mono text-gray-300 overflow-x-auto"
              >
                <pre><code>{
  "repo": "my-org/my-app",
  "branch": "feat/login",
  "commit": "8f3a2b1...",
  "tests": [
    {
      "title": "user can login",
      "outcome": "passed",
      "durationMs": 1200,
      "source": "playwright"
    }
  ]
}</code></pre>
              </div>
            </UCard>
          </div>
        </section>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const activeSection = ref("overview");

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // Add a toast notification here in a real app
};

const navItems = [
  { id: "overview", label: "Overview", icon: "i-lucide-info" },
  { id: "playwright", label: "Playwright", icon: "i-lucide-monitor" },
  { id: "jest", label: "Jest / Vitest", icon: "i-lucide-webhook" },
  { id: "api", label: "REST API", icon: "i-lucide-code-2" },
];
</script>
