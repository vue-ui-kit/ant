<script setup lang="ts" generic="T extends Recordable = Recordable">
  import type { PFormItemProps } from '#/antProxy';
  import { defaultItemResponsive, watchPreviousDeep } from '@/utils/core';
  import RenderAntItem from '@/components/RenderAntItem';
  import RenderItemSlots from '@/components/RenderItemSlots';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { v4 as uuid_v4 } from 'uuid';
  import { ref } from 'vue';
  import { isEqual, debounce, isFunction, omit } from 'xe-utils';

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
      <template v-if="item.tooltipConfig" #tooltip>
        <a-tooltip
          v-if="isFunction(item.tooltipConfig.title)"
          v-bind="omit(item.tooltipConfig, ['title'])"
        >
          <info-circle-outlined class="cursor-pointer py-4 px-2" />
          <template #title>
            <div v-html="item.tooltipConfig.title()" />
          </template>
        </a-tooltip>
        <a-tooltip v-else v-bind="item.tooltipConfig">
          <info-circle-outlined class="cursor-pointer py-4 px-2" />
        </a-tooltip>
      </template>
    </a-form-item>
  </a-col>
</template>
