<script
  lang="ts"
  setup
  generic="T extends Recordable = Recordable, B extends Recordable = Recordable"
>
  import Cell from 'e-virt-table/dist/lib/Cell';
  import type CellType from 'e-virt-table/dist/lib/Cell';
  import EVirtTable from 'e-virt-table';
  import type {
    Column as EVirtColumn,
    ConfigType,
    OverlayerContainer,
    FormatterMethod,
  } from 'e-virt-table';
  import { ref, onMounted, nextTick, computed, useAttrs, watch } from 'vue';
  import { EventCallback } from 'e-virt-table/dist/lib/EventBus';
  import { isEqual, isString } from 'xe-utils';
  import {
    Cascader as ACascader,
    DatePicker as ADatePicker,
    InputNumber as AInputNumber,
    Select as ASelect,
    TimePicker as ATimePicker,
  } from 'ant-design-vue';
  import renderStore from '@/store/renderStore';
  import RenderEditCell from './RenderEditCell';
  import RenderAntCell from './RenderAntCell';
  import type { CanvasColumnProps, CellFuncArg, PFormatter } from '#/antProxy';
  import { v4 as uuidv4 } from 'uuid';
  import { antFormatters } from '@/utils/AFormatters';

  const emit = defineEmits<{
    (e: 'change', value: any[]): void; // 需要默认实现change，不能动态绑定
    (e: 'ready', value: EVirtTable): void;
  }>();
  const props = defineProps({
    columns: {
      type: Array as () => CanvasColumnProps<T>[],
      required: true,
      default: () => [],
    },
    data: {
      type: Array as () => T[],
      required: true,
      default: () => [],
    },
    footerData: {
      type: Array as () => B[],
      required: false,
      default: () => [],
    },
    config: {
      type: Object as () => ConfigType,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });
  watch(
    props.data,
    (newValue) => {
      eVirtTable?.loadData(newValue);
    },
    { deep: true },
  );
  watch(
    () => props.columns,
    (newValue, oldValue) => {
      if (!isEqual(newValue, oldValue)) {
        eVirtTable?.loadColumns(newValue as EVirtColumn[]);
      }
    },
    { deep: true },
  );
  watch(
    props.footerData,
    (newValue) => {
      eVirtTable?.loadFooterData(newValue);
    },
    { deep: true },
  );
  let eVirtTable: EVirtTable | null = null;
  const attrs = useAttrs();
  const eVirtTableRef = ref(null);
  const eVirtTableEditorRef = ref(null);
  const eVirtTableEmptyRef = ref(null);
  const eVirtTableOverlayerRef = ref(null);
  const editorCell = ref<Cell>();
  const editorType = ref<string>('text');
  const eVirtTableEditorSelectRef = ref<InstanceType<typeof ASelect> | null>(null);
  const selectValue = ref(null);
  const eVirtTableEditorCascaderRef = ref<InstanceType<typeof ACascader> | null>(null);
  const cascaderValue = ref(null);
  const eVirtTableEditorNumberRef = ref<InstanceType<typeof AInputNumber> | null>(null);
  const numberValue = ref();
  const eVirtTableEditorDateRef = ref<InstanceType<typeof ADatePicker> | null>(null);
  const dateValue = ref('');
  const eVirtTableEditorTimeRef = ref<InstanceType<typeof ATimePicker> | null>(null);
  const timeValue = ref('');
  const overlayerView = ref<OverlayerContainer>({
    views: [],
  });
  // 编辑器样式
  const editorStyle = computed(() => {
    const cell = editorCell.value;
    if (!cell) {
      return {};
    }
    return {
      width: `${cell.width}px`,
      height: `${cell.height}px`,
    };
  });
  const getFormatter = (name: string) => antFormatters[name] || (({ cellValue }) => cellValue);
  const transferFormatter =
    (formatter: PFormatter): FormatterMethod =>
    () => {
      return () => {};
    };
  const paseToEVirtColumn = (column: CanvasColumnProps<T>): EVirtColumn => {
    return {
      ...column,
      key: column.key || column.field || uuidv4(),
      formatter: isString(column.formatter) ? (column.formatter as string) : undefined,
    };
  };
  onMounted(() => {
    if (!eVirtTableRef.value) {
      return;
    }
    eVirtTable = new EVirtTable(eVirtTableRef.value, {
      config: props.config,
      columns: props.columns,
      data: props.data,
      emptyElement: eVirtTableEmptyRef.value || undefined,
      overlayerElement: eVirtTableOverlayerRef.value || undefined,
      editorElement: eVirtTableEditorRef.value || undefined,
    });
    // 动态绑定事件
    Object.keys(attrs).forEach((key) => {
      const func = attrs[key];
      if (typeof func === 'function' && key.startsWith('on')) {
        const _eventName = key.charAt(2).toLowerCase() + key.slice(3); // 去掉 'on' 前缀 只将 'on' 后第一个字母转换为小写
        eVirtTable?.on(_eventName, func as EventCallback);
      }
    });
    eVirtTable.on('change', (value) => {
      emit('change', value);
    });
    eVirtTable.on('overlayerChange', (overlayer: OverlayerContainer) => {
      overlayerView.value = overlayer;
    });
    eVirtTable.on('startEdit', (cell) => {
      editorCell.value = cell;
      editorType.value = cell.editorType;
      // 内部已经处理了文本类型的编辑
      if (editorType.value === 'text') {
        return;
      }
      if (editorType.value === 'select') {
        nextTick(() => {
          selectValue.value = cell.value;
          /* @ts-ignore */
          eVirtTableEditorSelectRef.value?.focus();
        });
        return;
      } else if (editorType.value === 'cascader') {
        nextTick(() => {
          cascaderValue.value = cell.value;
          /* @ts-ignore */
          eVirtTableEditorCascaderRef.value?.focus();
        });
        return;
      } else if (editorType.value === 'date') {
        nextTick(() => {
          dateValue.value = cell.value;
          const dateRef = eVirtTableEditorDateRef.value as any;
          dateRef?.focus();
        });
        return;
      } else if (editorType.value === 'time') {
        nextTick(() => {
          timeValue.value = cell.value;
          const timeRef = eVirtTableEditorTimeRef.value as any;
          timeRef?.focus();
        });
        return;
      } else if (editorType.value === 'number') {
        nextTick(() => {
          numberValue.value = cell.value;
          /* @ts-ignore */
          eVirtTableEditorNumberRef.value?.focus();
        });
        return;
      } else if (renderStore.renders[editorType.value]) {
      }
    });
    eVirtTable.on('doneEdit', () => {
      editorType.value = 'text';
    });
    emit('ready', eVirtTable);
  });
  function saveCellValue(value) {
    if (!eVirtTable || !editorCell.value) {
      return;
    }
    const { rowKey, key } = editorCell.value;
    eVirtTable?.setItemValueByEditor(rowKey, key, value);
  }
</script>
<template>
  <a-spin :spinning="loading">
    <div ref="eVirtTableRef">
      <div ref="eVirtTableEditorRef">
        <!-- 自定义编辑器 -->
        <render-edit-cell
          v-if="renderStore.renders[editorType]?.renderEdit"
          :cell-render="{
            name: editorType,
          }"
          :render-table-params="{
            data: props.data,
            row: editorCell?.row,
            rowIndex: editorCell?.rowIndex ?? -1,
            field: editorCell?.key ?? '',
            title: editorCell?.column?.title ?? '',
          }"
          @change="saveCellValue"
        />
      </div>
      <div ref="eVirtTableEmptyRef">
        <slot name="empty">
          <!-- 自定义空数据 -->
          <a-empty description="空数据" />
        </slot>
      </div>
      <div ref="eVirtTableOverlayerRef">
        <!-- 自定覆盖层 -->
        <div
          :class="wrapper.class"
          v-for="wrapper in overlayerView.views"
          :style="wrapper.style"
          :key="wrapper.type"
        >
          <div :style="view.style" v-for="view in wrapper.views" :key="view.key">
            <div
              class="cell"
              v-for="cell in view.cells"
              :key="`${cell.rowKey}_${cell.key}`"
              :style="cell.style"
            >
              <component
                v-if="typeof cell.render === 'function'"
                :is="cell.render(cell)"
              ></component>
              <template
                v-else-if="typeof cell.render === 'string' && cell.render.startsWith('slot:')"
              >
                <slot :name="cell.render.replace('slot:', '')" v-bind="cell" :cell="cell"></slot>
              </template>
              <template v-else-if="typeof cell.render === 'string'">
                <render-ant-cell
                  v-if="renderStore.renders[cell.render]?.renderDefault"
                  :cell-render="{
                    name: cell.render,
                  }"
                  :render-table-params="{
                    row: cell.row,
                    rowIndex: (cell as CellType).rowIndex,
                    field: cell.key,
                    title: cell.column?.title ?? '',
                  }"
                  :default-handler="{}"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>
