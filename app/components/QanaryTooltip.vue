<template>
  <UTooltip
    :content="{
      align: 'center',
      side: 'top',
      sideOffset: 8,
      ...content,
    }"
    arrow
    v-bind="$attrs"
  >
    <slot />
  </UTooltip>
</template>

<script lang="ts" setup>
defineProps<{
  content?: any;
}>();
</script>
