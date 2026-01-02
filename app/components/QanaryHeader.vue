<template>
  <div
    class="flex items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800 mb-4"
  >
    <div class="flex items-center gap-4 min-w-0">
      <NuxtLink
        class="flex items-center gap-3 hover:opacity-90 transition-opacity"
        to="/"
      >
        <img
          alt="QAnary"
          class="h-10 w-auto"
          src="@/assets/brand/qanary-logo.png"
        />
        <div
          class="hidden sm:block h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"
        />
        <div class="min-w-0">
          <div
            class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
          >
            {{ props.subtitle ?? "Unified Testing Platform" }}
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="flex items-center gap-3">
      <div
        class="hidden md:flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800"
      >
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        System Online
      </div>
      <UButton color="neutral" icon="i-lucide-github" variant="ghost" />
      <UButton
        color="neutral"
        icon="i-lucide-settings"
        variant="ghost"
        @click="navigateTo('/config')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  subtitle?: string;
}>();
</script>
