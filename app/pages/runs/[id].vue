<template>
  <UContainer class="py-6 space-y-6">
    <QanaryHeader subtitle="Run details" />

    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <UButton
          color="neutral"
          icon="i-lucide-arrow-left"
          label="Back"
          variant="ghost"
          @click="navigateTo('/')"
        />

        <div class="flex items-center gap-2">
          <div class="text-xl font-semibold">Run #{{ run?.id || "-" }}</div>

          <UBadge
            v-if="run"
            :color="mergeColor(run.mergeStatus)"
            class="capitalize"
            variant="soft"
          >
            <div class="flex items-center gap-1.5">
              <UIcon
                v-if="run.mergeStatus === 'partial'"
                class="w-3.5 h-3.5 animate-spin"
                name="i-lucide-refresh-cw"
              />
              {{ run.mergeStatus }}
            </div>
          </UBadge>

          <UBadge
            v-if="run"
            :color="outcomeColor(run.outcome)"
            class="capitalize"
            variant="soft"
          >
            {{ run.outcome }}
          </UBadge>
        </div>

        <div v-if="run" class="text-sm text-muted">
          {{ run.repo }} · {{ run.branch }} · {{ run.commit.substring(0, 7) }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          :loading="pending"
          color="neutral"
          icon="i-lucide-refresh-cw"
          label="Refresh"
          variant="outline"
          @click="refresh"
        />
      </div>
    </div>

    <div v-if="run" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard class="relative overflow-hidden">
        <div class="absolute right-[-10px] top-[-10px] opacity-10">
          <UIcon class="w-20 h-20" name="i-lucide-list" />
        </div>
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Total Tests
        </div>
        <div class="text-3xl font-bold mt-1">{{ run.totals.total }}</div>
        <div class="mt-2 text-xs text-gray-500">Across all sources</div>
      </UCard>

      <UCard
        class="relative overflow-hidden ring-1 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10"
      >
        <div
          class="absolute right-[-10px] top-[-10px] opacity-10 text-green-500"
        >
          <UIcon class="w-20 h-20" name="i-lucide-check-circle" />
        </div>
        <div
          class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider"
        >
          Passed
        </div>
        <div class="text-3xl font-bold mt-1 text-green-700 dark:text-green-300">
          {{ run.totals.passed }}
        </div>
        <div class="mt-2 text-xs text-green-600/60">
          {{ Math.round((run.totals.passed / run.totals.total) * 100) }}%
          Success Rate
        </div>
      </UCard>

      <UCard
        class="relative overflow-hidden ring-1 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
      >
        <div class="absolute right-[-10px] top-[-10px] opacity-10 text-red-500">
          <UIcon class="w-20 h-20" name="i-lucide-x-circle" />
        </div>
        <div
          class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider"
        >
          Failed
        </div>
        <div class="text-3xl font-bold mt-1 text-red-700 dark:text-red-300">
          {{ run.totals.failed }}
        </div>
        <div class="mt-2 text-xs text-red-600/60">Requires attention</div>
      </UCard>

      <UCard
        class="relative overflow-hidden ring-1 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10"
      >
        <div
          class="absolute right-[-10px] top-[-10px] opacity-10 text-blue-500"
        >
          <UIcon class="w-20 h-20" name="i-lucide-clock" />
        </div>
        <div
          class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider"
        >
          Duration
        </div>
        <div class="text-3xl font-bold mt-1 text-blue-700 dark:text-blue-300">
          {{ formatDuration(run.durationMs) }}
        </div>
        <div class="mt-2 text-xs text-blue-600/60">Total execution time</div>
      </UCard>
    </div>

    <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div
        class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 w-full md:w-auto"
      >
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 group relative',
            activeFilter === filter.value
              ? filter.value === 'passed'
                ? 'bg-green-500 text-white shadow-sm shadow-green-500/20'
                : filter.value === 'failed'
                  ? 'bg-red-500 text-white shadow-sm shadow-red-500/20'
                  : filter.value === 'skipped'
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : filter.value === 'passed'
                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'
                : filter.value === 'failed'
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                  : filter.value === 'skipped'
                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="activeFilter = filter.value"
        >
          <UIcon
            v-if="filter.icon"
            :name="filter.icon"
            class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
          />
          {{ filter.label }}
          <span
            :class="[
              'px-1.5 py-0.5 rounded-md text-[10px] font-mono transition-colors',
              activeFilter === filter.value
                ? 'bg-white/20 text-white'
                : filter.value === 'passed'
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                  : filter.value === 'failed'
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                    : filter.value === 'skipped'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
            ]"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>

      <UInput
        v-model="searchQuery"
        class="w-full md:w-64"
        icon="i-lucide-search"
        placeholder="Search tests..."
        variant="subtle"
      />
    </div>

    <UCard :ui="{ body: 'p-0!' }" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="text-lg font-bold">Test Suites</div>
          <div v-if="run" class="text-xs font-medium text-gray-400 uppercase">
            Showing {{ filteredTests.length }} of {{ run.tests.length }} tests
          </div>
        </div>
      </template>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <!-- Parent Suites -->
        <div
          v-for="(parentSuite, parentName) in hierarchicalTests"
          :key="parentName"
          class="group"
        >
          <!-- Parent Suite Header -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="toggleExpand(`p-${parentName}`)"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="
                  isExpanded(`p-${parentName}`)
                    ? 'i-lucide-chevron-down'
                    : 'i-lucide-chevron-right'
                "
                class="w-4 h-4 text-gray-400"
              />
              <span
                class="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight"
                >{{ parentName }}</span
              >
            </div>

            <div class="flex items-center gap-4">
              <div
                class="hidden sm:flex h-1.5 w-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
              >
                <div
                  :style="{
                    width: (parentSuite.passed / parentSuite.total) * 100 + '%',
                  }"
                  class="h-full bg-green-500"
                />
                <div
                  :style="{
                    width: (parentSuite.failed / parentSuite.total) * 100 + '%',
                  }"
                  class="h-full bg-red-500"
                />
              </div>
              <div class="flex gap-2">
                <UBadge
                  v-if="parentSuite.failed"
                  color="error"
                  size="xs"
                  variant="soft"
                  >{{ parentSuite.failed }}</UBadge
                >
                <UBadge
                  v-if="parentSuite.passed"
                  color="success"
                  size="xs"
                  variant="soft"
                  >{{ parentSuite.passed }}</UBadge
                >
              </div>
            </div>
          </div>

          <!-- Files within Parent Suite -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0 overflow-hidden"
            enter-to-class="max-h-[5000px] opacity-100 overflow-hidden"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-[5000px] opacity-100 overflow-hidden"
            leave-to-class="max-h-0 opacity-0 overflow-hidden"
          >
            <div
              v-show="isExpanded(`p-${parentName}`)"
              class="divide-y divide-gray-100 dark:divide-gray-800"
            >
              <div
                v-for="(fileSuite, fileName) in parentSuite.files"
                :key="fileName"
              >
                <!-- File Header -->
                <div
                  class="flex items-center justify-between p-3 pl-8 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                  @click="toggleExpand(`f-${parentName}-${fileName}`)"
                >
                  <div class="flex items-center gap-3">
                    <UIcon
                      :name="
                        isExpanded(`f-${parentName}-${fileName}`)
                          ? 'i-lucide-chevron-down'
                          : 'i-lucide-chevron-right'
                      "
                      class="w-4 h-4 text-gray-400"
                    />
                    <UIcon
                      class="w-4 h-4 text-primary-500/70"
                      name="i-lucide-file-code"
                    />
                    <span
                      class="text-sm font-semibold text-gray-600 dark:text-gray-300"
                      >{{ fileName }}</span
                    >
                  </div>
                  <div class="flex gap-2">
                    <UBadge
                      v-if="fileSuite.failed"
                      color="error"
                      size="xs"
                      variant="soft"
                      >{{ fileSuite.failed }}</UBadge
                    >
                    <UBadge
                      v-if="fileSuite.passed"
                      color="success"
                      size="xs"
                      variant="soft"
                      >{{ fileSuite.passed }}</UBadge
                    >
                  </div>
                </div>

                <!-- Suites within File -->
                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="max-h-0 opacity-0 overflow-hidden"
                  enter-to-class="max-h-[2000px] opacity-100 overflow-hidden"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="max-h-[2000px] opacity-100 overflow-hidden"
                  leave-to-class="max-h-0 opacity-0 overflow-hidden"
                >
                  <div
                    v-show="isExpanded(`f-${parentName}-${fileName}`)"
                    class="bg-white dark:bg-black/20"
                  >
                    <div
                      v-for="(suite, suiteName) in fileSuite.suites"
                      :key="suiteName"
                    >
                      <!-- Suite Header -->
                      <div
                        class="flex items-center justify-between p-2 pl-14 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                        @click="
                          toggleExpand(
                            `s-${parentName}-${fileName}-${suiteName}`,
                          )
                        "
                      >
                        <div class="flex items-center gap-3">
                          <UIcon
                            :name="
                              isExpanded(
                                `s-${parentName}-${fileName}-${suiteName}`,
                              )
                                ? 'i-lucide-chevron-down'
                                : 'i-lucide-chevron-right'
                            "
                            class="w-3.5 h-3.5 text-gray-400"
                          />
                          <span
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                            >{{ suiteName }}</span
                          >
                        </div>
                        <div class="flex gap-2">
                          <UBadge
                            v-if="suite.failed"
                            color="error"
                            size="xs"
                            variant="soft"
                            >{{ suite.failed }}</UBadge
                          >
                          <UBadge
                            v-if="suite.passed"
                            color="success"
                            size="xs"
                            variant="soft"
                            >{{ suite.passed }}</UBadge
                          >
                        </div>
                      </div>

                      <!-- Tests within Suite -->
                      <Transition
                        enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="max-h-0 opacity-0 overflow-hidden"
                        enter-to-class="max-h-[1000px] opacity-100 overflow-hidden"
                        leave-active-class="transition-all duration-150 ease-in"
                        leave-from-class="max-h-[1000px] opacity-100 overflow-hidden"
                        leave-to-class="max-h-0 opacity-0 overflow-hidden"
                      >
                        <div
                          v-show="
                            isExpanded(
                              `s-${parentName}-${fileName}-${suiteName}`,
                            )
                          "
                          class="divide-y divide-gray-50 dark:divide-gray-900"
                        >
                          <div
                            v-for="test in suite.tests"
                            :key="test.id"
                            class="flex flex-col"
                          >
                            <div
                              :class="{
                                'bg-primary-50/20 dark:bg-primary-900/5':
                                  isExpanded(`t-${test.id}`),
                              }"
                              class="flex items-center justify-between p-2 pl-20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer transition-colors"
                              @click="toggleExpand(`t-${test.id}`)"
                            >
                              <div class="flex items-center gap-3 min-w-0">
                                <UIcon
                                  :class="
                                    test.outcome === 'passed'
                                      ? 'text-green-500'
                                      : test.outcome === 'failed'
                                        ? 'text-red-500'
                                        : 'text-gray-400'
                                  "
                                  :name="
                                    test.outcome === 'passed'
                                      ? 'i-lucide-check-circle'
                                      : test.outcome === 'failed'
                                        ? 'i-lucide-x-circle'
                                        : 'i-lucide-circle-dashed'
                                  "
                                  class="w-5 h-5 flex-shrink-0"
                                />
                                <span
                                  :class="
                                    test.outcome === 'failed'
                                      ? 'text-red-700 dark:text-red-400 font-medium'
                                      : 'text-gray-700 dark:text-gray-300'
                                  "
                                  class="text-sm truncate"
                                >
                                  {{ stripAnsi(test.title) }}
                                </span>
                              </div>
                              <div
                                class="flex items-center gap-4 flex-shrink-0"
                              >
                                <span
                                  class="text-[10px] font-mono text-gray-400"
                                  >{{ formatDuration(test.durationMs) }}</span
                                >
                                <div
                                  v-if="test.attachments?.length"
                                  class="flex -space-x-1"
                                >
                                  <div
                                    v-for="(
                                      attachment, idx
                                    ) in test.attachments"
                                    :key="idx"
                                    :title="attachment.name"
                                    class="w-4 h-4 rounded-full border border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                                  >
                                    <UIcon
                                      :name="
                                        attachment.type === 'image'
                                          ? 'i-lucide-image'
                                          : attachment.type === 'video'
                                            ? 'i-lucide-video'
                                            : 'i-lucide-file-text'
                                      "
                                      class="w-2.5 h-2.5 text-gray-400"
                                    />
                                  </div>
                                </div>
                                <UIcon
                                  v-if="
                                    test.steps?.length ||
                                    test.error ||
                                    test.attachments?.length
                                  "
                                  :name="
                                    isExpanded(`t-${test.id}`)
                                      ? 'i-lucide-chevron-up'
                                      : 'i-lucide-chevron-down'
                                  "
                                  class="w-4 h-4 text-gray-300"
                                />
                              </div>
                            </div>

                            <!-- Test Details (Steps, Errors) -->
                            <div
                              v-show="isExpanded(`t-${test.id}`)"
                              class="p-4 pl-24 bg-gray-50 dark:bg-gray-900/40 space-y-4 border-t border-gray-100 dark:border-gray-800"
                            >
                              <div
                                v-if="test.error"
                                class="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/30"
                              >
                                <div class="flex items-start gap-3">
                                  <UIcon
                                    class="w-5 h-5 text-red-500 mt-0.5"
                                    name="i-lucide-alert-circle"
                                  />
                                  <div class="space-y-2 overflow-hidden">
                                    <div
                                      class="text-sm font-bold text-red-700 dark:text-red-400"
                                    >
                                      {{ stripAnsi(test.error.message) }}
                                    </div>
                                    <pre
                                      v-if="test.error.stack"
                                      class="text-xs font-mono text-red-600/80 dark:text-red-300/60 overflow-x-auto p-3 bg-white/50 dark:bg-black/30 rounded border border-red-100/50 dark:border-red-900/20 whitespace-pre-wrap"
                                      >{{ stripAnsi(test.error.stack) }}</pre
                                    >
                                  </div>
                                </div>
                              </div>

                              <div
                                v-if="test.attachments?.length"
                                class="space-y-3"
                              >
                                <div
                                  class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"
                                >
                                  Attachments
                                  <div
                                    class="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"
                                  />
                                </div>
                                <div
                                  class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                >
                                  <div
                                    v-for="(
                                      attachment, idx
                                    ) in test.attachments"
                                    :key="idx"
                                    class="group/attachment relative flex flex-col bg-white dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-primary-500/20 transition-all"
                                  >
                                    <div
                                      class="aspect-video bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center"
                                    >
                                      <img
                                        v-if="attachment.type === 'image'"
                                        :alt="attachment.name"
                                        :src="attachment.url"
                                        class="object-contain w-full h-full"
                                        loading="lazy"
                                      />
                                      <video
                                        v-else-if="attachment.type === 'video'"
                                        :src="attachment.url"
                                        class="object-contain w-full h-full"
                                        controls
                                      />
                                      <div
                                        v-else
                                        class="flex flex-col items-center gap-2 text-gray-400"
                                      >
                                        <UIcon
                                          :name="
                                            attachment.type === 'text'
                                              ? 'i-lucide-file-text'
                                              : 'i-lucide-paperclip'
                                          "
                                          class="w-8 h-8 opacity-50"
                                        />
                                      </div>

                                      <div
                                        class="absolute inset-0 bg-black/40 opacity-0 group-hover/attachment:opacity-100 transition-opacity flex items-center justify-center gap-2"
                                      >
                                        <UButton
                                          v-if="attachment.url !== '#'"
                                          :to="attachment.url"
                                          color="white"
                                          external
                                          icon="i-lucide-external-link"
                                          size="xs"
                                          target="_blank"
                                          variant="solid"
                                        />
                                        <UButton
                                          color="white"
                                          icon="i-lucide-maximize"
                                          size="xs"
                                          variant="solid"
                                          @click.stop
                                        />
                                      </div>
                                    </div>

                                    <div
                                      class="p-2.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800"
                                    >
                                      <div class="min-w-0">
                                        <div
                                          class="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate"
                                        >
                                          {{ attachment.name }}
                                        </div>
                                        <div
                                          class="text-[9px] text-gray-400 font-mono"
                                        >
                                          {{ attachment.contentType }} ·
                                          {{
                                            Math.round(
                                              (attachment.size || 0) / 1024,
                                            )
                                          }}
                                          KiB
                                        </div>
                                      </div>
                                      <UIcon
                                        :class="
                                          attachment.type === 'image'
                                            ? 'text-blue-400'
                                            : attachment.type === 'video'
                                              ? 'text-purple-400'
                                              : 'text-gray-400'
                                        "
                                        :name="
                                          attachment.type === 'image'
                                            ? 'i-lucide-image'
                                            : attachment.type === 'video'
                                              ? 'i-lucide-video'
                                              : 'i-lucide-file-text'
                                        "
                                        class="w-4 h-4 flex-shrink-0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div v-if="test.steps?.length" class="space-y-3">
                                <div
                                  class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"
                                >
                                  Execution Body
                                  <div
                                    class="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"
                                  />
                                </div>
                                <div class="space-y-1">
                                  <div
                                    v-for="(step, idx) in test.steps"
                                    :key="idx"
                                    class="flex items-center justify-between p-2 rounded-md hover:bg-white dark:hover:bg-gray-800/50 transition-colors group/step"
                                  >
                                    <div class="flex items-center gap-3">
                                      <UIcon
                                        :class="
                                          step.outcome === 'passed'
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                        "
                                        :name="
                                          step.outcome === 'passed'
                                            ? 'i-lucide-check'
                                            : 'i-lucide-x'
                                        "
                                        class="w-3.5 h-3.5"
                                      />
                                      <span
                                        class="text-xs text-gray-600 dark:text-gray-400 group-hover/step:text-gray-900 dark:group-hover/step:text-gray-100"
                                        >{{ stripAnsi(step.title) }}</span
                                      >
                                    </div>
                                    <span
                                      class="text-[10px] font-mono text-gray-400"
                                      >{{
                                        formatDuration(step.durationMs)
                                      }}</span
                                    >
                                  </div>
                                </div>
                              </div>

                              <div
                                v-if="
                                  !test.error &&
                                  !test.steps?.length &&
                                  !test.attachments?.length
                                "
                                class="text-xs text-gray-500 italic flex items-center gap-2"
                              >
                                <UIcon
                                  class="w-3.5 h-3.5"
                                  name="i-lucide-info"
                                />
                                No detailed logs, steps, or attachments
                                available for this test.
                              </div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div
        v-if="pending"
        class="p-12 flex flex-col items-center justify-center gap-3 text-gray-400"
      >
        <UIcon
          class="w-8 h-8 animate-spin text-primary"
          name="i-lucide-loader-2"
        />
        <span class="text-sm font-medium">Loading test hierarchy...</span>
      </div>

      <div
        v-if="!pending && filteredTests.length === 0"
        class="p-12 text-center text-gray-500"
      >
        <UIcon
          class="w-12 h-12 mx-auto mb-4 opacity-20"
          name="i-lucide-search-x"
        />
        <p class="text-xs italic">
          No tests match your current search or filter criteria.
        </p>
      </div>
    </UCard>

    <div
      v-if="error"
      class="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100"
    >
      <div class="font-bold mb-1">Error loading run</div>
      {{ errorMessage }}
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import type { RunDetail, TestCase } from "~/types/qanary";
import { stripAnsi } from "~/utils/ansi";

const route = useRoute();
const runId = computed(() => String(route.params.id ?? ""));

const mergeColor = (s: string) => (s === "complete" ? "success" : "warning");

const outcomeColor = (o: string) => {
  if (o === "passed") return "success";
  if (o === "failed") return "error";
  return "info";
};

const formatDuration = (ms: number) => {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

const { data, pending, error, refresh } = useFetch<RunDetail>(
  `/api/runs/${runId.value}`,
  {
    key: `run-${runId.value}`,
  },
);

const run = computed(() => data.value);

const activeFilter = ref("all");
const searchQuery = ref("");
const expandedState = useState<Record<string, boolean>>(
  `expanded-run-${runId.value}`,
  () => ({}),
);

// We use onMounted to initialize the expansion state on the client side only
// OR we ensure the logic is identical and data is available.
// Given the hydration issues with icons, it's safer to either:
// 1. Wrap the icons in <ClientOnly>
// 2. Or make sure the state is absolutely stable.

onMounted(() => {
  if (run.value && Object.keys(expandedState.value).length === 0) {
    const firstParent = run.value.tests[0]?.parentSuite;
    if (firstParent) {
      expandedState.value[`p-${firstParent}`] = true;
    }
  }
});

const toggleExpand = (key: string) => {
  expandedState.value[key] = !expandedState.value[key];
};

const isExpanded = (key: string) => !!expandedState.value[key];

const filters = computed(() => [
  {
    label: "All",
    value: "all",
    count: run.value?.totals.total ?? 0,
    icon: "i-lucide-layers",
  },
  {
    label: "Passed",
    value: "passed",
    count: run.value?.totals.passed ?? 0,
    icon: "i-lucide-check-circle",
  },
  {
    label: "Failed",
    value: "failed",
    count: run.value?.totals.failed ?? 0,
    icon: "i-lucide-x-circle",
  },
  {
    label: "Skipped",
    value: "skipped",
    count: run.value?.totals.skipped ?? 0,
    icon: "i-lucide-circle-dashed",
  },
]);

const filteredTests = computed(() => {
  if (!run.value) return [];
  return run.value.tests.filter((t) => {
    const matchesFilter =
      activeFilter.value === "all" || t.outcome === activeFilter.value;
    const matchesSearch =
      !searchQuery.value ||
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.suite.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.file &&
        t.file.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (t.parentSuite &&
        t.parentSuite.toLowerCase().includes(searchQuery.value.toLowerCase()));
    return matchesFilter && matchesSearch;
  });
});

type HierarchicalSuite = {
  passed: number;
  failed: number;
  total: number;
  files: Record<
    string,
    {
      passed: number;
      failed: number;
      total: number;
      suites: Record<
        string,
        {
          passed: number;
          failed: number;
          total: number;
          tests: TestCase[];
        }
      >;
    }
  >;
};

const hierarchicalTests = computed(() => {
  const root: Record<string, HierarchicalSuite> = {};

  filteredTests.value.forEach((test) => {
    const parentName = test.parentSuite || "Other";
    const fileName = test.file || "Other";
    const suiteName = test.suite || "General";

    if (!root[parentName]) {
      root[parentName] = { passed: 0, failed: 0, total: 0, files: {} };
    }
    if (!root[parentName].files[fileName]) {
      root[parentName].files[fileName] = {
        passed: 0,
        failed: 0,
        total: 0,
        suites: {},
      };
    }
    if (!root[parentName].files[fileName].suites[suiteName]) {
      root[parentName].files[fileName].suites[suiteName] = {
        passed: 0,
        failed: 0,
        total: 0,
        tests: [],
      };
    }

    const suite = root[parentName].files[fileName].suites[suiteName];
    suite.tests.push(test);

    // Update counts
    if (test.outcome === "passed") {
      root[parentName].passed++;
      root[parentName].files[fileName].passed++;
      suite.passed++;
    } else if (test.outcome === "failed") {
      root[parentName].failed++;
      root[parentName].files[fileName].failed++;
      suite.failed++;
    }

    root[parentName].total++;
    root[parentName].files[fileName].total++;
    suite.total++;
  });

  return root;
});

const errorMessage = computed(() => {
  const e = error.value as any;
  return e?.data?.message || e?.message || "Failed to load run";
});
</script>
