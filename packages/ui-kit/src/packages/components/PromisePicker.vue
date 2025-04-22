<script lang="ts" setup name="PromisePicker" generic="D = Recordable, F = Recordable">
  import { PropType, reactive, ref, computed } from 'vue';
  import { PGridInstance, PGridProps } from '#/antProxy';
  import PGrid from '@/components/PGrid.vue';
  import { $warning } from '@/hooks/useMessage';
  import { Button as AButton, Modal as AModal } from 'ant-design-vue';

  const gridEl = ref<PGridInstance<D>>();
  const props = defineProps({
    gridSetting: {
      type: Object as PropType<PGridProps<D, F>>,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      default: '数据选择',
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: '70%',
    },
    multipleAllowEmpty: {
      type: Boolean,
      default: false,
    },
    bodyStyle: {
      type: Object,
      default: () => ({}),
    },
  });
  const isMultiple = computed(() => props.gridSetting.selectConfig?.multiple);
  let resolvePromise: (
    value: { row: D; field?: string } | PromiseLike<{ row: D; field?: string }>,
  ) => void;
  let multipleResolver: (rows: D[]) => void;
  let rejectPromise: (reason?: any) => void;
  const visible = reactive({
    modal: false,
  });
  const handleCancel = () => {
    if (rejectPromise) {
      rejectPromise();
    }
  };

  const manualCancel = () => {
    visible.modal = false;
    if (rejectPromise) {
      rejectPromise();
    }
  };
  const selectRow = ({ row, field }: { row: D; field?: string }) => {
    // 单选才关闭结束选择
    if (resolvePromise && !isMultiple.value) {
      visible.modal = false;
      resolvePromise({ row, field });
    }
  };
  const endMultiplePicker = () => {
    const records = gridEl.value?.selectedRecords ?? [];
    if (records.length === 0 && !props.multipleAllowEmpty) {
      $warning('请选择数据');
    } else {
      visible.modal = false;
      multipleResolver(records);
    }
  };
  defineExpose({
    pick: () =>
      new Promise<{ row: D; field?: string } | D[]>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
        visible.modal = true;
      }),
    pickMultiple: () =>
      new Promise<{ row: D; field?: string } | D[]>((resolve, reject) => {
        multipleResolver = resolve;
        rejectPromise = reject;
        visible.modal = true;
      }),
    grid: gridEl,
    hide: () => {
      visible.modal = false;
    }
  });
</script>
<template>
  <a-modal
    v-model:open="visible.modal"
    destroy-on-close
    :title="title"
    :width="width"
    :footer="isMultiple ? undefined : null"
    @cancel="handleCancel"
    :body-style="bodyStyle"
  >
    <p-grid v-bind="gridSetting" ref="gridEl" @pick="selectRow" />
    <template v-if="isMultiple" #footer>
      <div class="w-full text-right p-2">
        <span>
          <a-button class="mr-4" @click="manualCancel"> 取消 </a-button>
          <a-button type="primary" @click="endMultiplePicker"> 确定 </a-button>
        </span>
      </div>
    </template>
  </a-modal>
</template>
