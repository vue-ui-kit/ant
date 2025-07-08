<script lang="ts" setup name="TableInput" generic="D = Recordable">
  import { computed, PropType, watch } from 'vue';
  import { TableProps } from 'ant-design-vue';
  import { ColumnProps } from '#/antProxy';
  import { cleanCol } from '@/utils/core';
  import RenderDefaultSlots from '@/components/RenderDefaultSlots';
  import { merge } from 'xe-utils';

  const props = defineProps({
    modelValue: {
      type: Array as PropType<D[]>,
      default: () => [],
    },
    tableConfig: {
      type: Object as PropType<TableProps>,
      default: () => ({}),
    },
    editColumns: {
      type: Array as PropType<ColumnProps[]>,
      default: () => [],
    },
  });
  const defaultTableConfig = {
    size: 'small',
    // sticky: true,
    pagination: false,
  };
  watch(
    () => props.modelValue,
    () => {
      emit('trigger');
    },
    { deep: true },
  );
  const tc = computed(() => merge({}, defaultTableConfig, props.tableConfig));
  const emit = defineEmits(['update:modelValue', 'trigger']);
  const innerValue = computed<Partial<D>[]>({
    get: () => props.modelValue ?? ([] as Partial<D>[]),
    set: (val: Partial<D>[]) => {
      emit('update:modelValue', val);
    },
  });

  const totalColumns = computed<ColumnProps[]>(() => [
    ...props.editColumns,
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      cellRender: {
        name: 'ButtonTree',
        children: [
          {
            content: '删除',
            type: 'link',
            danger: true,
            clickEvt: ({ rowIndex }) => deleteRow(rowIndex),
          },
        ],
      },
    },
  ]);
  const addRow = () => {
    // innerValue.value.push({})
    innerValue.value = [...innerValue.value, {}];
  };
  const deleteRow = (index: number) => {
    // innerValue.value.splice(index, 1)
    innerValue.value = innerValue.value.filter((_, i) => i !== index);
  };
  const slotDefaultColumns = computed(() => {
    let count = 0;
    return totalColumns.value.filter((col) => {
      if ((col.slots && col.slots.default) || col.formatter || col.cellRender) {
        if (!col.field) {
          col.field = '__holder__' + count;
          count++;
        }
        return true;
      } else {
        return false;
      }
    });
  });
</script>
<template>
  <div>
    <a-table :data-source="innerValue" v-bind="tc" :columns="totalColumns.map((c) => cleanCol(c))">
      <template v-if="slotDefaultColumns.length > 0" #bodyCell="{ column, record, index }">
        <a-form-item-rest>
          <render-default-slots
            v-if="slotDefaultColumns.some((s) => column.key && s.field === column.key)"
            :key="index"
            :row-index="index"
            :default-handler="{}"
            :column="slotDefaultColumns.find((f) => column.key && f.field === column.key)!"
            :row="record"
            :table-data="innerValue as Recordable[]"
          />
        </a-form-item-rest>
      </template>
    </a-table>
    <div class="text-right mt-4px">
      <a-button type="primary" @click="addRow">+添加</a-button>
    </div>
  </div>
</template>
