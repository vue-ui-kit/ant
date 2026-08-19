<script generic="F extends Recordable = Recordable" lang="ts" name="PSearchForm" setup>
  import type { PFormInstance, PFormItemProps, PSearchFormProps } from '#/antProxy';
  import PForm from '@/components/PForm.vue';
  import { useFormRowLayout } from '@/hooks/useFormRowLayout';
  import { Spin as ASpin } from 'ant-design-vue';
  import { computed, useTemplateRef } from 'vue';
  import { omit } from 'xe-utils';

  const props = withDefaults(defineProps<PSearchFormProps<F>>(), {
    autoReset: true,
    labelCol: () => ({ flex: 'none' }),
    showActions: true,
    wrapperCol: () => ({ flex: 'auto' }),
  });
  const emit = defineEmits<{
    search: [data: F];
    reset: [];
  }>();

  const formRef = useTemplateRef<PFormInstance>('formRef');
  const formProps = computed(() =>
    omit(props, ['autoReset', 'data', 'items', 'loading', 'showActions']),
  );
  const withDefaultWidth = (style: unknown) => {
    const defaultStyle = { width: '100%' };

    if (!style) return defaultStyle;
    if (Array.isArray(style)) return [defaultStyle, ...style];
    if (typeof style === 'object') return { ...defaultStyle, ...style };
    return [defaultStyle, style];
  };
  const searchItems = computed<PFormItemProps<F>[]>(() =>
    props.items.map((item) =>
      item.itemRender
        ? {
            ...item,
            itemRender: {
              ...item.itemRender,
              attrs: {
                ...item.itemRender.attrs,
                style: withDefaultWidth(item.itemRender.attrs?.style),
              },
            },
          }
        : item,
    ),
  );
  const { isSingleRow } = useFormRowLayout(searchItems);
  const keepActionsInline = computed(() => props.showActions && isSingleRow.value);
  const searchFormClass = computed(() =>
    ['p-search-form', keepActionsInline.value && 'p-search-form--single-row']
      .filter(Boolean)
      .join(' '),
  );
  const actionItem = computed<PFormItemProps<F>>(() => ({
    col: { flex: 'auto' },
    align: 'right',
    itemRender: {
      name: '$buttons',
      children: [
        {
          props: {
            content: '查询',
            htmlType: 'submit',
            type: 'primary',
            loading: props.loading,
          },
        },
        {
          props: { content: '重置', htmlType: props.autoReset ? 'reset' : 'button' },
          events: props.autoReset ? undefined : { click: () => emit('reset') },
        },
      ],
    },
  }));
  const formItems = computed<PFormItemProps<F>[]>(() =>
    props.showActions ? [...searchItems.value, actionItem.value] : searchItems.value,
  );

  defineExpose({
    reset: () => formRef.value?.reset(),
    $form: computed(() => formRef.value?.$form),
  });
</script>

<template>
  <a-spin :spinning="loading" :wrapper-class-name="searchFormClass">
    <p-form
      ref="formRef"
      v-bind="formProps"
      :data="data"
      :items="formItems"
      @apply="emit('search', $event)"
      @reset="emit('reset')"
    />
  </a-spin>
</template>
