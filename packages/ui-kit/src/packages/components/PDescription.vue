<script lang="ts" setup generic="D extends Recordable = Recordable" name="PDescription">
  import { computed } from 'vue';
  import type { PDescriptionProps } from '#/antProxy';
  import PDescriptionContent from '@/components/PDescriptionContent';

  const props = withDefaults(defineProps<PDescriptionProps<D>>(), {
    bordered: false,
    column: 3,
    size: 'default',
    layout: 'horizontal',
    colon: true,
    emptyText: '-',
  });

  const descAttrs = computed(() => ({
    title: props.title,
    extra: props.extra,
    bordered: props.bordered,
    size: props.size,
    column: props.column,
    layout: props.layout,
    colon: props.colon,
    labelStyle: props.labelStyle,
    contentStyle: props.contentStyle,
  }));
</script>
<template>
  <a-descriptions v-bind="descAttrs" class="p-description">
    <template v-if="$slots.title || title" #title>
      <slot name="title">{{ title }}</slot>
    </template>
    <template v-if="$slots.extra || extra" #extra>
      <slot name="extra">{{ extra }}</slot>
    </template>

    <a-descriptions-item
      v-for="(item, idx) in items"
      :key="`_desc_${item.field ?? idx}`"
      :label="item.label"
      :span="item.span"
      :label-style="item.labelStyle"
      :content-style="item.contentStyle"
    >
      <template v-if="item.slots?.label" #label>
        <component :is="item.slots.label" />
      </template>
      <p-description-content :item="item" :data="data" :empty-text="emptyText || '-'" />
    </a-descriptions-item>
  </a-descriptions>
</template>
