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
    CellParams,
    OverlayerContainer,
    FormatterMethod,
  } from 'e-virt-table';
  import { ref, onMounted, computed, useAttrs, watch } from 'vue';
  import { EventCallback } from 'e-virt-table/dist/lib/EventBus';
  import { isArray, isEqual, isFunction, isString, omit } from 'xe-utils';
  import renderStore from '@/store/renderStore';
  import RenderEditCell from './RenderEditCell';
  import type { CanvasColumnProps, CanvasTableProps, FormatterFunc, CellRender } from '#/antProxy';
  import { v4 as uuidv4 } from 'uuid';
  import { antFormatters } from '@/utils/AFormatters';

  const emit = defineEmits<{
    (e: 'change', value: any[]): void; // 需要默认实现change，不能动态绑定
    (e: 'ready', value: EVirtTable): void;
  }>();
  const defaultConfig = {
    DISABLED: true,
  };
  const props = defineProps<CanvasTableProps<T, B>>();
  let eVirtTable: EVirtTable | null = null;
  const attrs = useAttrs();
  const eVirtTableRef = ref(null);
  const eVirtTableEditorRef = ref(null);
  const eVirtTableEmptyRef = ref(null);
  const eVirtTableOverlayerRef = ref(null);
  const editorCell = ref<Cell>();
  const editorType = ref<string>('text');
  const overlayerView = ref<OverlayerContainer>();
  const cacheEditorSlotColumns: Record<string, CanvasColumnProps<T>> = {};
  const cacheEditorRenders: Record<string, CellRender> = {};
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
  const getCellRender = (name: string) => renderStore.renders[name]?.renderDefault;
  const transferFormatter =
    (formatter: FormatterFunc, ...restArgs: any[]): FormatterMethod =>
    ({ row, rowIndex, value }) =>
      formatter(
        {
          row,
          rowIndex,
          cellValue: value,
        },
        ...restArgs,
      );
  // 将复杂的三元运算符拆分成函数
  const getRenderFunction = (column: CanvasColumnProps<T>) => {
    if (column.slots?.default && isFunction(column.slots?.default)) {
      return (cell: CellParams) =>
        column.slots?.default?.({
          row: cell.row,
          column: column,
          rowIndex: cell.rowIndex,
        });
    }

    if (column.slots?.default && isString(column.slots?.default)) {
      return `slot:${column.slots?.default}`;
    }

    if (column.cellRender && column.cellRender.name) {
      return (cell: CellParams) =>
        getCellRender(column.cellRender!.name)?.(
          column.cellRender!,
          {
            data: props.data,
            row: cell.row,
            rowIndex: cell.rowIndex,
            field: column.field || cell.column.key,
            title: cell.column?.title ?? '',
          },
          {},
        );
    }

    return undefined;
  };
  const parseToEVirtColumn = (column: CanvasColumnProps<T>): EVirtColumn => {
    if (column.slots?.edit && (column.field || column.key) && isFunction(column.slots?.edit)) {
      cacheEditorSlotColumns[`__slot:${column.field || column.key}`] = column;
    } else if (column.editRender?.name && (column.field || column.key)) {
      cacheEditorRenders[column.field! || column.key!] = column.editRender;
    }
    return {
      ...omit(column, ['formatter']),
      key: column.key || column.field || uuidv4(),
      formatter: isString(column.formatter)
        ? transferFormatter(getFormatter(column.formatter as string))
        : isArray(column.formatter) && isString(column.formatter[0])
          ? transferFormatter(getFormatter(column.formatter[0]), ...column.formatter.slice(1))
          : isFunction(column.formatter)
            ? transferFormatter(column.formatter as FormatterFunc)
            : undefined,
      editorType:
        column.editorType ??
        (column.slots?.edit && (column.field || column.key) && isFunction(column.slots?.edit)
          ? `__slot:${column.field || column.key}`
          : column.editRender?.name
            ? column.editRender.name
            : undefined),
      render: getRenderFunction(column),
      children: column.children?.map((child) => parseToEVirtColumn(child)),
    };
  };
  onMounted(() => {
    if (!eVirtTableRef.value) {
      return;
    }
    eVirtTable = new EVirtTable(eVirtTableRef.value, {
      config: {
        ...defaultConfig,
        ...props.config,
      },
      columns: props.columns.map((col) => parseToEVirtColumn(col)),
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
        eVirtTable?.loadColumns(newValue.map((col) => parseToEVirtColumn(col)));
      }
    },
    { deep: true },
  );
  watch(
    () => props.config,
    (newValue) => {
      eVirtTable?.loadConfig(newValue);
    },
    { deep: true },
  );
  watch(
    () => props.footerData,
    (newValue) => {
      eVirtTable?.loadFooterData(newValue || []);
    },
    { deep: true },
  );
  const getPopupContainer = () => {
    return document.body;
  };
</script>
<template>
  <a-spin :spinning="loading">
    <div ref="eVirtTableRef">
      <div ref="eVirtTableEditorRef">
        <!-- 插槽编辑器 -->
        <component
          v-if="editorType.startsWith('__slot:')"
          :is="
            cacheEditorSlotColumns[editorType]!.slots!.edit!({
              row: editorCell!.row,
              column: cacheEditorSlotColumns[editorType],
              rowIndex: editorCell!.rowIndex,
            })
          "
          :bordered="false"
          :style="editorStyle"
          class="ev-editor-wrapper"
          :get-popup-container="getPopupContainer"
          v-model:value="editorCell!.value"
          :cell="editorCell"
          @blur="saveCellValue"
        >
        </component>
        <!-- 自定义编辑器 -->
        <render-edit-cell
          v-else-if="renderStore.renders[editorType]?.renderEdit"
          :cell-render="cacheEditorRenders[editorCell!.key]"
          class="ev-editor-wrapper"
          :style="editorStyle"
          :render-table-params="{
            data: props.data,
            row: editorCell?.row,
            rowIndex: editorCell?.rowIndex ?? -1,
            field: editorCell?.key ?? '',
            title: editorCell?.column?.title ?? '',
          }"
          :bordered="false"
          :get-popup-container="getPopupContainer"
          @blur="saveCellValue"
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
          v-for="wrapper in overlayerView?.views || []"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>
