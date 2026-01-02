<template>
  <TooltipProvider>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from "reka-ui";
</script>
