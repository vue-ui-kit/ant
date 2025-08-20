<script setup lang="ts">
  import { ref } from 'vue';

  interface Props {
    /** 是否默认折叠 */
    defaultCollapsed?: boolean;
    title?: string;
    /** 是否可以折叠 */
    collapsible?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: undefined,
    defaultCollapsed: false,
    collapsible: false,
  });
  const slots = defineSlots<{
    title: () => any;
  }>();
  const activeKey = ref(props.defaultCollapsed ? [] : ['content']);
  defineExpose({
    collapse: () => {
      activeKey.value = [];
    },
    expand: () => {
      activeKey.value = ['content'];
    },
  });
</script>

<template>
  <a-collapse v-if="collapsible" v-model:active-key="activeKey" class="collapsible-card">
    <a-collapse-panel key="content" force-render :header="title">
      <template v-if="slots.title" #header>
        <slot name="title" />
      </template>
      <slot />
    </a-collapse-panel>
  </a-collapse>
  <a-card v-else size="small" :title="title">
    <template v-if="slots.title" #title>
      <slot name="title" />
    </template>
    <slot />
  </a-card>
</template>
