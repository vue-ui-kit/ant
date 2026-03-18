<script setup lang="ts" generic="T extends Recordable = Recordable">
  import type { PFormItemProps } from '#/antProxy';
  import { defaultItemResponsive, watchPreviousDeep } from '@/utils/core';
  import RenderAntItem from '@/components/RenderAntItem';
  import RenderItemSlots from '@/components/RenderItemSlots';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { Tooltip as ATooltip } from 'ant-design-vue';
  import { v4 as uuid_v4 } from 'uuid';
  import { ref, computed, h } from 'vue';
  import { isEqual, debounce, isFunction, omit } from 'xe-utils';
  import { getTooltipRenderer } from '@/utils/config';

  const props = defineProps<{
    item: PFormItemProps<T>;
    formData: T;
  }>();
  const emit = defineEmits<{
    (e: 'trigger', cusFields?: string | string[]): void;
    (e: 'reset'): void;
  }>();
  const hangOut = ref(false);
  const renderFormKey = ref(uuid_v4());
  const handleDelayTrigger = (cusFields?: string | string[], time?: number) => {
    const delayTime = time ?? 222;
    hangOut.value = true;
    setTimeout(() => {
      hangOut.value = false;
      emit('trigger', cusFields);
    }, delayTime);
  };
  const handleTrigger = (cusFields?: string | string[]) => {
    emit('trigger', cusFields);
  };
  const resetFormData = () => {
    emit('reset');
  };
  const refreshCol = () => {
    renderFormKey.value = uuid_v4();
  };
  const debounceRefreshCol = debounce(refreshCol, 100);

  // 将 tooltipConfig 统一渲染为函数式组件，支持全局 renderTooltip 替换
  const tooltipNode = computed<(() => any) | null>(() => {
    if (!props.item.tooltipConfig) return null;
    const config = props.item.tooltipConfig;
    const renderTooltip = getTooltipRenderer();
    const defaultSlot = () => h(InfoCircleOutlined, { class: 'cursor-pointer py-4 px-2' });
    const content: string | (() => any) = isFunction(config.title)
      ? config.title
      : String(config.title ?? '');

    if (renderTooltip) {
      return () => renderTooltip(defaultSlot, content);
    }

    // 默认使用 a-tooltip
    return () =>
      isFunction(config.title)
        ? h(ATooltip, omit(config, ['title']) as any, {
            default: defaultSlot,
            title: () => h('div', { innerHTML: config.title!() }),
          })
        : h(ATooltip, config as any, { default: defaultSlot });
  });

  watchPreviousDeep(
    () => props.item,
    (cur, old) => {
      if (!isEqual(cur, old)) {
        debounceRefreshCol();
      }
    },
    { deep: true },
  );
</script>

<template>
  <a-col
    :key="`_col_${renderFormKey}`"
    v-bind="item.col ?? (item.span ? { span: item.span } : defaultItemResponsive)"
  >
    <a-form-item
      :key="`_item_${renderFormKey}`"
      :class="[
        `p-content-align-${item.align ?? 'left'} ${item.forceRequired ? 'p-required' : ''}`,
        { 'p-error-hang-out': hangOut },
      ]"
      colon
      :label="item.title"
      :name="item.field"
      :wrapper-col="item.wrapperCol ?? (item.title ? undefined : { span: 24 })"
      v-bind="
        omit(item, [
          'field',
          'title',
          'span',
          'col',
          'wrapperCol',
          'itemRender',
          'forceRequired',
          'tooltip',
        ])
      "
    >
      <template v-if="item.slots?.title" #label>
        <component :is="item.slots.title" />
      </template>
      <render-item-slots
        v-if="item.slots?.default"
        :key="`_sl_${item.field ?? '_'}_${renderFormKey}`"
        :form-data="formData"
        :item="item"
        :pass-delay-trigger="handleDelayTrigger"
        :pass-trigger="handleTrigger"
      />
      <render-ant-item
        v-else-if="item.itemRender?.name"
        :key="`_re_${item.field ?? '_'}_${renderFormKey}`"
        :default-handler="{ reset: resetFormData }"
        :item-render="item.itemRender"
        :render-form-params="{ data: formData as Recordable, field: item.field }"
        @delay-trigger="handleDelayTrigger"
        @trigger="handleTrigger"
      />
      <span v-else />
      <template v-if="tooltipNode" #tooltip>
        <component :is="tooltipNode" />
      </template>
    </a-form-item>
  </a-col>
</template>
