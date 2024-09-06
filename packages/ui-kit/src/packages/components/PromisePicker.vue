<script lang="ts" setup name="PromisePicker" generic="D = Recordable, F = Recordable">
  import { PropType, reactive, ref } from 'vue';
  import { PGridInstance, PGridProps } from '#/antProxy';
  import PGrid from '@/components/PGrid.vue';

  const gridEl = ref<PGridInstance<D>>();
  defineProps({
    gridSetting: {
      type: Object as PropType<PGridProps<D, F>>,
      required: true,
    },
    title: {
      type: String,
      default: '数据选择',
    },
    width: {
      type: [String, Number],
      default: '70%',
    },
  });
  let resolvePromise: (
    value: { row: D; field?: string } | PromiseLike<{ row: D; field?: string }>,
  ) => void;
  let rejectPromise: (reason?: any) => void;
  const visible = reactive({
    modal: false,
  });
  const handleCancel = () => {
    if (rejectPromise) {
      rejectPromise();
    }
  };
  const selectRow = ({ row, field }: { row: D; field?: string }) => {
    if (resolvePromise) {
      visible.modal = false;
      resolvePromise({ row, field });
    }
  };
  defineExpose({
    pick: () =>
      new Promise<{ row: D; field?: string }>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
        visible.modal = true;
      }),
  });
</script>
<template>
  <a-modal
    v-model:open="visible.modal"
    destroy-on-close
    :title="title"
    :width="width"
    :footer="null"
    @cancel="handleCancel"
  >
    <p-grid v-bind="gridSetting" ref="gridEl" @pick="selectRow" />
  </a-modal>
</template>
