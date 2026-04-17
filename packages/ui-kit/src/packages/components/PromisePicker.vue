<script
  lang="ts"
  setup
  name="PromisePicker"
  generic="D extends Recordable = Recordable, F extends Recordable = Recordable"
>
  import { PGridInstance, PGridProps, PromisePickerProps } from '#/antProxy';
  import PGrid from '@/components/PGrid.vue';
  import { $warning } from '@/hooks/useMessage';
  import { Button as AButton, Modal as AModal } from 'ant-design-vue';
  import { computed, reactive, ref } from 'vue';

  const gridEl = ref<PGridInstance<D>>();

  const props = withDefaults(defineProps<PromisePickerProps<D, F>>(), {
    title: '数据选择',
    width: '70%',
    multipleAllowEmpty: false,
    bodyStyle: () => ({}),
    beforePick: () => Promise.resolve(),
  });
  const isMultiple = computed(() => props.gridSetting.selectConfig?.multiple);
  /**
   * 合并内置的 `fitContent: true`：
   * - 弹窗容器由内容撑开，外层不写死高度；
   * - 数据少时按内容自然高显示，避免出现大面积空白；
   * - 数据多时由外层 `max-height` 限制总高度，表格内部 `scroll.y` 作为上限滚动。
   * 用户在 `gridSetting` 中若显式传入 `fitContent`/`renderY` 可覆盖。
   */
  const mergedGridSetting = computed<PGridProps<D, F>>(() => ({
    fitContent: true,
    ...props.gridSetting,
  }));
  const pickerBodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    maxHeight: 'min(80dvh, calc(100dvh - 200px))',
    overflow: 'hidden',
  } as const;
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
      props.beforePick(row).then(() => {
        visible.modal = false;
        resolvePromise({ row, field });
      });
    }
  };
  const endMultiplePicker = () => {
    const records = gridEl.value?.selectedRecords ?? [];
    if (records.length === 0 && !props.multipleAllowEmpty) {
      $warning('请选择数据');
    } else {
      props.beforePick(records).then(() => {
        visible.modal = false;
        multipleResolver(records);
      });
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
    },
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
    <div :style="pickerBodyStyle">
      <p-grid v-bind="mergedGridSetting" ref="gridEl" @pick="selectRow" />
    </div>
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
