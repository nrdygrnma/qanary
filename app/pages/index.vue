<template>
  <UContainer class="py-6 space-y-6">
    <QanaryHeader subtitle="Live merged reporting for Playwright + Jest" />

    <UCard class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-lg font-bold">Recent Runs</div>
            <div class="text-sm text-muted">
              Frontend + API merged into a single timeline
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              :loading="pending"
              icon="i-lucide-refresh-cw"
              variant="ghost"
              @click="() => refresh()"
            />
            <UButton
              icon="i-lucide-plus"
              variant="soft"
              @click="navigateTo('/config')"
            >
              New Run
            </UButton>
          </div>
        </div>
      </template>

      <ClientOnly>
        <UTable
          :columns="columns"
          :data="rows"
          :loading="pending"
          class="w-full"
          @select="onSelect"
        >
          <template #repo-cell="{ row }">
            <div class="flex flex-col py-1">
              <span class="font-bold text-gray-900 dark:text-white">{{
                (row.original as RunSummary).repo
              }}</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <UIcon
                  class="w-3 h-3 text-gray-400"
                  name="i-lucide-git-branch"
                />
                <span class="text-xs text-gray-500 font-medium">{{
                  (row.original as RunSummary).branch
                }}</span>
                <span
                  class="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded"
                  >{{
                    (row.original as RunSummary).commit.substring(0, 7)
                  }}</span
                >
              </div>
            </div>
          </template>

          <template #totals-cell="{ row }">
            <div class="space-y-1.5 py-1">
              <div
                class="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <div
                  v-if="(row.original as RunSummary).totals.passed > 0"
                  :style="{
                    width:
                      ((row.original as RunSummary).totals.passed /
                        (row.original as RunSummary).totals.total) *
                        100 +
                      '%',
                  }"
                  class="h-full bg-green-500 transition-all duration-500"
                  title="Passed"
                />
                <div
                  v-if="(row.original as RunSummary).totals.failed > 0"
                  :style="{
                    width:
                      ((row.original as RunSummary).totals.failed /
                        (row.original as RunSummary).totals.total) *
                        100 +
                      '%',
                  }"
                  class="h-full bg-red-500 transition-all duration-500"
                  title="Failed"
                />
                <div
                  v-if="(row.original as RunSummary).totals.skipped > 0"
                  :style="{
                    width:
                      ((row.original as RunSummary).totals.skipped /
                        (row.original as RunSummary).totals.total) *
                        100 +
                      '%',
                  }"
                  class="h-full bg-gray-400 transition-all duration-500"
                  title="Skipped"
                />
              </div>
              <div
                class="flex items-center justify-between text-[10px] font-bold tracking-tight"
              >
                <div class="flex gap-2.5">
                  <span class="text-green-600 dark:text-green-400"
                    >{{
                      (row.original as RunSummary).totals.passed
                    }}
                    PASSED</span
                  >
                  <span
                    v-if="(row.original as RunSummary).totals.failed"
                    class="text-red-600 dark:text-red-400"
                    >{{
                      (row.original as RunSummary).totals.failed
                    }}
                    FAILED</span
                  >
                </div>
                <span class="text-gray-400 uppercase"
                  >{{ (row.original as RunSummary).totals.total }} TOTAL</span
                >
              </div>
            </div>
          </template>

          <template #sources-cell="{ row }">
            <div class="flex -space-x-1.5 overflow-hidden">
              <div
                v-for="source in (row.original as RunSummary).sources"
                :key="source"
                :title="source"
                class="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-50 dark:bg-gray-800 text-gray-400"
              >
                <UIcon
                  :name="
                    source === 'playwright'
                      ? 'i-lucide-monitor'
                      : 'i-lucide-webhook'
                  "
                  class="w-3.5 h-3.5"
                />
              </div>
            </div>
          </template>

          <template #mergeStatus-cell="{ row }">
            <div class="flex items-center gap-2">
              <UBadge
                :color="mergeColor((row.original as RunSummary).mergeStatus)"
                class="capitalize font-medium"
                variant="subtle"
              >
                {{ (row.original as RunSummary).mergeStatus }}
              </UBadge>
              <UIcon
                v-if="(row.original as RunSummary).mergeStatus === 'partial'"
                class="w-4 h-4 text-warning-500 animate-pulse"
                name="i-lucide-loader-2"
                title="Awaiting more sources..."
              />
            </div>
          </template>

          <template #outcome-cell="{ row }">
            <UBadge
              :color="outcomeColor((row.original as RunSummary).outcome)"
              class="capitalize px-2.5"
              variant="solid"
            >
              {{ (row.original as RunSummary).outcome }}
            </UBadge>
          </template>

          <template #updatedAt-cell="{ row }">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDateTime((row.original as RunSummary).updatedAt) }}
            </span>
          </template>
        </UTable>
        <template #fallback>
          <div class="p-8 flex items-center justify-center">
            <UIcon
              class="w-8 h-8 animate-spin text-primary"
              name="i-lucide-loader-2"
            />
          </div>
        </template>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { RunSummary } from "~/types/qanary";
import { useRuns } from "@/composables/useRuns";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Vienna",
  }).format(d);
};

const mergeColor = (s: RunSummary["mergeStatus"]) => {
  if (s === "complete") return "success";
  if (s === "partial") return "warning";
  return "neutral";
};

const outcomeColor = (o: RunSummary["outcome"]) => {
  if (o === "passed") return "success";
  if (o === "failed") return "error";
  return "info";
};

let timer: number | any;
const { data, pending, refresh } = useRuns();

const rows = computed<RunSummary[]>(() => data.value?.runs ?? []);

const columns: TableColumn<RunSummary>[] = [
  {
    id: "repo",
    accessorKey: "repo",
    header: "Repository",
    meta: {
      class: {
        td: "min-w-[200px]",
      },
    },
  },
  {
    id: "sources",
    header: "Sources",
  },
  {
    id: "totals",
    header: "Progress",
    meta: {
      class: {
        td: "min-w-[150px]",
      },
    },
  },
  {
    id: "mergeStatus",
    accessorKey: "mergeStatus",
    header: "Status",
  },
  {
    id: "outcome",
    accessorKey: "outcome",
    header: "Outcome",
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Finished",
  },
];

const onSelect = (_e: Event, row: TableRow<RunSummary>) => {
  navigateTo(`runs/${row.original.id}`);
};

onMounted(() => {
  timer = window.setInterval(() => refresh(), 5000);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});
</script>
