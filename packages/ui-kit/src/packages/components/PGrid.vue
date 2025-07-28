<script
  generic="D extends Recordable = Recordable, F extends Recordable = Recordable"
  lang="ts"
  name="PGrid"
  setup
>
  import { ColumnProps, PFormItemProps, PGridProps, ResponsePathConfig } from '#/antProxy';
  import {
    computed,
    useAttrs,
    ref,
    Ref,
    reactive,
    onMounted,
    watch,
    toRefs,
    onBeforeUnmount,
  } from 'vue';
  import {
    debounce,
    get,
    isArray,
    isBoolean,
    isFunction,
    isObject,
    isString,
    merge,
    omit,
    toNumber,
  } from 'xe-utils';
  import { eachTree } from '@/utils/treeHelper';
  import { message as $message } from 'ant-design-vue';
  import RenderTitleSlots from '@/components/RenderTitleSlots';
  import RenderDefaultSlots from '@/components/RenderDefaultSlots';
  import { v4 as uuid_v4 } from 'uuid';
  import { isGoodValue } from '@/utils/is';
  import PFormCol from '@/components/PFormCol.vue';
  import { cleanCol, defaultLabelCol } from '@/utils/core';
  import { getGridDefaults } from '@/utils/config';
  import Icon from '@/renders/Icon';
  import { $confirm } from '@/hooks/useMessage';
  import {
    Table as ATable,
    Button as AButton,
    Form as AForm,
    Row as ARow,
    Spin as ASpin,
  } from 'ant-design-vue';
  import { TablePaginationConfig } from 'ant-design-vue/es/table/interface';
  import { DownOutlined } from '@ant-design/icons-vue';

  const props = defineProps<PGridProps<D, F>>();

  // 应用默认值
  const gridDefaults = getGridDefaults();
  const propsWithDefaults = computed(() => ({
    ...props,
    rowKey: props.rowKey ?? 'id',
    scrollMode: props.scrollMode ?? 'inner',
    align: props.align ?? gridDefaults.align ?? 'left',
    lazyReset: props.lazyReset ?? gridDefaults.lazyReset ?? false,
    fitHeight: props.fitHeight ?? gridDefaults.fitHeight ?? 170,
  }));

  const {
    formConfig,
    pageConfig,
    columns,
    toolbarConfig,
    proxyConfig,
    tableConfig,
    selectConfig,
    scrollMode,
  } = toRefs(props);
  const loading = reactive({
    table: false,
    toolbar: false,
    form: false,
  });
  const setLoadings = (value: boolean | Record<string, boolean>) => {
    if (isObject(value)) {
      Object.keys(value).forEach((key) => {
        loading[key] = value[key];
      });
    } else if (isBoolean(value)) {
      loading.form = value;
      loading.table = value;
      loading.toolbar = value;
    }
  };
  const boxEl = ref<HTMLDivElement>();
  const pFormWrapper = ref<HTMLDivElement>();
  const renderHeight = ref(500);
  const selectedRowKeys = ref<Array<string | number>>([]);
  const selectedCaches = ref<D[]>([]);
  const innerToolbarHandler = (code: string) => {
    const { ajax } = proxyConfig.value!;
    switch (code) {
      case 'multiDelete':
        if (ajax.multiDelete) {
          if (selectedRowKeys.value.length > 0) {
            $confirm({
              title: '警告',
              content: '确认删除选中的数据吗？',
            }).then(() => {
              loading.table = true;
              loading.toolbar = true;
              ajax.multiDelete!(selectedRowKeys.value)
                .then(() => {
                  $message.success('删除成功');
                  resetPage();
                })
                .catch(() => {
                  $message.error('删除失败');
                })
                .finally(() => {
                  loading.table = false;
                  loading.toolbar = false;
                  codeLoadings.multiDelete = false;
                });
            });
          } else {
            $message.warn('请选择要删除的数据');
          }
        }
        break;
    }
  };
  const slotTitleColumns = computed(() => {
    const cols: ColumnProps<D>[] = [];
    eachTree(columns.value ?? [], (col) => {
      if (col.slots && col.slots.title) {
        if (!col.field) {
          col.field = '__holder__' + cols.length;
        }
        cols.push(col);
      }
    });
    return cols;
  });
  const formEl = ref();
  const tableEl = ref();
  const renderFormKey = ref(uuid_v4());
  const renderTableKey = ref(uuid_v4());

  const codeLoadings = reactive<Record<string, boolean>>(
    [
      ...(props.toolbarConfig?.buttons?.map((m) => m.code) ?? []).filter((f) => f),
      ...(props.toolbarConfig?.tools?.map((m) => m.code) ?? []).filter((f) => f),
    ].reduce(
      (acc, cur) => {
        acc[cur!] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );
  const setBtnLoading = (code: string, value: boolean) => {
    codeLoadings[code] = value;
  };
  const refreshTable = () => {
    renderTableKey.value = uuid_v4();
  };
  const debounceRefreshTable = debounce(refreshTable, 100);
  const slotDefaultColumns = computed(() => {
    const cols: ColumnProps<D>[] = [];
    eachTree(columns.value ?? [], (col) => {
      if ((col.slots && col.slots.default) || col.formatter || col.cellRender) {
        if (!col.field) {
          col.field = '__holder__' + cols.length;
        }
        cols.push(col);
      }
    });
    return cols;
  });
  const pagination = reactive<IPage>({
    page: 1,
    size: pageConfig.value?.pageSize ?? 10,
  });
  const dataSeed = ref(0);
  const totalCount = ref(0);
  const tableData = ref<D[]>([]) as Ref<D[]>;
  const mode = computed<'list' | 'pagination' | 'bad'>(() =>
    proxyConfig.value && proxyConfig.value.ajax
      ? pageConfig.value
        ? 'pagination'
        : 'list'
      : 'bad',
  );
  const attrs = useAttrs();
  const emit = defineEmits<{
    (
      event: 'toolbarButtonClick',
      data: { data: D[]; code: string; selectedKeys: Array<string | number>; records: D[] },
    ): void;
    (
      event: 'toolbarToolClick',
      data: { data: D[]; code: string; selectedKeys: Array<string | number>; records: D[] },
    ): void;
    (event: 'pick', data: { row: D; field: string }): void;
    (event: 'resetQuery'): void;
  }>();
  // @ts-ignore
  const selectedRecords = computed<D[]>(() =>
    selectedCaches.value.filter((f) =>
      selectedRowKeys.value.includes(f[props.rowKey ?? 'id'] as string | number),
    ),
  );
  const toolBtnClick = (code: string) => {
    emit('toolbarButtonClick', {
      data: tableData.value,
      code,
      selectedKeys: selectedRowKeys.value,
      records: selectedRecords.value,
    });
    innerToolbarHandler(code);
  };
  const debounceToolBtnClick = debounce(toolBtnClick, 100);
  const toolBtnMenuClick = ({ key }) => debounceToolBtnClick(key);
  const toolToolClick = (code: string) => {
    emit('toolbarToolClick', {
      data: tableData.value,
      code,
      selectedKeys: selectedRowKeys.value,
      records: selectedRecords.value,
    });
    innerToolbarHandler(code);
  };
  const debounceToolToolClick = debounce(toolToolClick, 100);
  const queryFormData = ref<Partial<F>>({}) as Ref<Partial<F>>;
  const pickRow = ({ row, field }: { row: D; field: string }) => {
    emit('pick', { row, field });
  };
  const resetQueryFormData = (lazy?: boolean) => {
    if (formConfig.value && formConfig.value.items.length > 0) {
      if (formConfig.value.customReset) {
        formConfig.value.customReset();
      } else {
        const obj: Partial<F> = {};
        eachTree(formConfig.value.items, (item) => {
          if (item.field && item.itemRender) {
            if (isGoodValue(item.itemRender.defaultValue)) {
              obj[item.field] = item.itemRender.defaultValue;
            } else {
              obj[item.field] = undefined;
            }
          } else if (item.field && item.slots) {
            if (isGoodValue(item.slots.defaultValue)) {
              obj[item.field] = item.slots.defaultValue;
            } else {
              obj[item.field] = undefined;
            }
          }
        });
        queryFormData.value = obj;
      }
      emit('resetQuery');
    }

    pagination.page = 1;
    if (!lazy) {
      debounceFetchData();
    }
  };
  const handleResponse = (response: Recordable, pathConfig?: ResponsePathConfig<D>) =>
    pathConfig
      ? {
          list: isString(pathConfig.list)
            ? get(response, pathConfig.list)
            : isFunction(pathConfig.list)
              ? pathConfig.list(response)
              : undefined,
          total: isString(pathConfig.total)
            ? get(response, pathConfig.total)
            : isFunction(pathConfig.total)
              ? pathConfig.total(response)
              : undefined,
          result: isString(pathConfig.result)
            ? get(response, pathConfig.result)
            : isFunction(pathConfig.result)
              ? pathConfig.result(response)
              : undefined,
          message: isString(pathConfig.message)
            ? get(response, pathConfig.message)
            : isFunction(pathConfig.message)
              ? pathConfig.message(response)
              : undefined,
        }
      : {
          list: response,
        };
  const enoughSpacing = ref(true);
  const reload = () => {
    selectedCaches.value = [];
    selectedRowKeys.value = [];
    return resetQueryFormData();
  };
  const resetPage = () => {
    pagination.page = 1;
    selectedCaches.value = [];
    selectedRowKeys.value = [];
    return fetchData();
  };
  /**
   * @description
   * @param p
   * @param _filters todo filters
   * @param _sorter todo sorter
   */
  const handleTableChange = (p: TablePaginationConfig, _filters, _sorter) => {
    pagination.page = p.current!;
    pagination.size = p.pageSize!;
    return fetchData();
  };

  const fetchData = () =>
    new Promise<D[]>((resolve) => {
      if (mode.value !== 'bad') {
        loading.form = true;
        loading.table = true;
        const { ajax } = proxyConfig.value!;
        ajax
          .query({
            form: queryFormData.value,
            page: pagination,
          })
          .then((response) => {
            const { list, total, result, message } = handleResponse(
              response,
              proxyConfig.value!.response,
            );
            if (list) {
              tableData.value = list as D[];
              dataSeed.value++;
            } else if (result) {
              tableData.value = result as D[];
              totalCount.value = total ?? result.length;
              dataSeed.value++;
            } else {
              tableData.value = [];
              dataSeed.value++;
              if (message) {
                $message.warn(message);
              }
            }
            resolve(tableData.value as D[]);
          })
          .catch((e) => {
            console.error('fetchData error', e);
            resolve([] as D[]);
          })
          .finally(() => {
            loading.form = false;
            loading.table = false;
          });
      }
    });
  const debounceFetchData = debounce(fetchData, 160);
  const passQuery = (params: Partial<F>, lazy?: boolean) => {
    Object.assign(queryFormData.value, params);
    pagination.page = 1;
    return lazy ? Promise.resolve() : debounceFetchData();
  };
  const pg = computed(() =>
    mode.value === 'pagination'
      ? {
          current: pagination.page,
          total: totalCount.value,
          pageSize: pagination.size,
          responsive: false,
          showSizeChanger: true,
          showTotal: (total: number) => `共${total}条数据`,
        }
      : false,
  );
  const defaultTableConfig = {
    size: 'small',
    sticky: true,
    transformCellText: ({ text }) => {
      return isArray(text) && text.length === 0 ? '-' : text;
    },
  };
  const tc = computed(() =>
    merge(
      {},
      defaultTableConfig,
      tableConfig?.value ?? {},
      selectConfig.value
        ? {
            rowSelection: {
              type: selectConfig.value.multiple ? 'checkbox' : 'radio',
              preserveSelectedRowKeys: true,
              selectedRowKeys: selectedRowKeys.value,
              onChange: (selectedKeys: string[] | number[]) => {
                selectedRowKeys.value = selectedKeys;
                const primaryKey = props.rowKey ?? 'id';
                const cachedKeys = selectedCaches.value.map((m) => m[primaryKey]);
                const newKeys = selectedKeys.filter((f) => !cachedKeys.includes(f));
                const newRecords: D[] = newKeys
                  .map((m) => tableData.value.find((f) => f[primaryKey] === m))
                  .filter((f) => !!f) as D[];
                // @ts-ignore
                selectedCaches.value = [...selectedCaches.value, ...newRecords];
              },
              getCheckboxProps: selectConfig.value.getCheckboxProps,
            },
          }
        : {},
    ),
  );
  /*omit({labelCol:defaultLabelCol,...formConfig},['items'])*/
  const fc = computed(() => omit({ labelCol: defaultLabelCol, ...formConfig.value }, ['items']));
  const handleFormSubmit = () => {
    resetPage();
  };

  watch(
    () => [columns.value, proxyConfig.value, toolbarConfig.value],
    () => {
      debounceRefreshTable();
    },
    { deep: true },
  );
  const resizeTable = () => {
    const pNode = boxEl.value?.parentElement;
    const ph = pNode ? window.getComputedStyle(pNode).height : '0px';
    const formOriginHeight = pFormWrapper.value
      ? window.getComputedStyle(pFormWrapper.value).height
      : '0px';
    const formHeight = formOriginHeight.includes('px')
      ? toNumber(formOriginHeight.replace('px', ''))
      : 0;
    const showCountHeight = selectConfig.value?.showCount ? 22 : 0;
    renderHeight.value =
      props.renderY ??
      toNumber(ph.replace('px', '')) -
        propsWithDefaults.value.fitHeight -
        (props.toolbarConfig ? 30 : 0) -
        formHeight -
        showCountHeight;
    enoughSpacing.value = toNumber(ph.replace('px', '')) > 600;
  };
  defineExpose({
    commitProxy: {
      query: debounceFetchData,
      reload,
      reloadPage: resetPage,
      passQuery,
    },
    $table: computed(() => tableEl.value),
    selectedRowKeys: computed(() => selectedRowKeys.value),
    setBtnLoading,
    selectedRecords,
    $form: computed(() => formEl.value),
    getFormData: () => queryFormData.value,
    setLoadings,
    resizeTable,
  });

  let observer: MutationObserver;
  onMounted(() => {
    resizeTable();
    window.addEventListener('resize', resizeTable);
    // 还需要在组件根节点由不可见转为可见时重新计算高度（display:none等样式控制时）
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const el = mutation.target as HTMLElement;
          const style = window.getComputedStyle(el);
          if (style.display !== 'none') {
            resizeTable();
          }
        }
      });
    });

    if (boxEl.value) {
      observer.observe(boxEl.value, { attributes: true, attributeFilter: ['style'] });
    }
    resetQueryFormData(props.manualFetch);
  });
  const passFields = ['align'];
  const passDefaultColumnProps = (columns: ColumnProps<D>[]) =>
    columns.map((c) => ({
      ...passFields.reduce(
        (prev, cur) => ({
          [cur]: propsWithDefaults.value[cur],
        }),
        {} as ColumnProps<D>,
      ),
      ...c,
    }));
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeTable);
    observer.disconnect();
  });
</script>
<template>
  <div ref="boxEl" class="h-full p-wrapper flex flex-col gap-8px overflow-y-auto" v-bind="attrs">
    <div v-if="mode === 'bad'">请检查配置</div>
    <template v-else>
      <div
        v-if="formConfig?.items?.some((s: PFormItemProps<F>) => s.field && s.itemRender)"
        class="p-pane p-form-wrapper"
        ref="pFormWrapper"
      >
        <a-spin :spinning="loading.form">
          <a-form
            :key="renderFormKey"
            ref="formEl"
            :model="queryFormData"
            v-bind="fc"
            @submit="handleFormSubmit"
          >
            <a-row :gutter="[6, 12]">
              <p-form-col
                v-for="(item, idx) in formConfig!.items"
                :key="`_col_${item.field || idx}`"
                :form-data="queryFormData"
                :item="item as PFormItemProps<Partial<F>>"
                @reset="resetQueryFormData(propsWithDefaults.lazyReset)"
              />
            </a-row>
          </a-form>
        </a-spin>
      </div>
      <div
        v-if="toolbarConfig"
        class="p-toolbar-wrapper flex items-center w-full justify-between p-theme-bg pt-8px px-16px"
      >
        <div class="flex items-center flex-1 gap-4px">
          <template v-if="toolbarConfig.buttons && toolbarConfig.buttons.length > 0">
            <template v-for="(btn, idx) in toolbarConfig.buttons" :key="idx">
              <a-dropdown v-if="btn.dropdowns && btn.dropdowns.length">
                <template #overlay>
                  <a-menu @click="toolBtnMenuClick">
                    <a-menu-item v-for="sub in btn.dropdowns" :key="sub.code"
                      >{{ sub.content }}
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button
                  :type="btn.type"
                  :size="btn.size ?? 'middle'"
                  :disabled="toolbarConfig.disabled || btn.disabled"
                  :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                >
                  <Icon v-if="btn.icon" :icon="btn.icon" />
                  {{ btn.content }}
                  <DownOutlined />
                </a-button>
              </a-dropdown>
              <a-button
                v-else-if="btn.code"
                :type="btn.type"
                :size="btn.size ?? 'middle'"
                :disabled="toolbarConfig.disabled || btn.disabled"
                :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                @click="debounceToolBtnClick(btn.code)"
              >
                <Icon v-if="btn.icon" :icon="btn.icon" />
                {{ btn.content }}
              </a-button>
              <div v-else></div>
            </template>
          </template>
        </div>
        <span class="flex items-center gap-4px">
          <template v-if="toolbarConfig.tools && toolbarConfig.tools.length > 0">
            <a-button
              v-for="(tool, idx) in toolbarConfig.tools"
              :key="idx"
              :type="tool.type"
              :size="tool.size ?? 'middle'"
              :disabled="toolbarConfig.disabled || tool.disabled"
              @click="debounceToolToolClick(tool.code)"
              :loading="loading.toolbar || (!!tool.code && codeLoadings[tool.code])"
            >
              <Icon :icon="tool.icon" />
            </a-button>
          </template>
        </span>
      </div>
      <div :class="`p-pane flex-1 ${enoughSpacing ? 'h-0' : ''} p-${scrollMode ?? 'inner'}-scroll`">
        <div
          v-if="selectConfig?.multiple && selectConfig.showCount"
          class="w-full text-slate-5 pl-4"
        >
          已选：{{ selectedRowKeys.length }}
        </div>
        <a-table
          :key="renderTableKey + '_table'"
          :row-key="rowKey ?? 'id'"
          ref="tableEl"
          :columns="passDefaultColumnProps(columns ?? []).map((c) => cleanCol(c as ColumnProps))"
          :data-source="tableData"
          :loading="loading.table"
          :pagination="pg"
          v-bind="tc"
          :scroll="{
            x: 'max-content',
            y: renderHeight,
          }"
          @change="handleTableChange"
        >
          <template v-if="slotTitleColumns.length > 0" #headerCell="{ column }">
            <render-title-slots
              v-if="slotTitleColumns.some((s) => column.key && s.field === column.key)"
              :key="renderTableKey + '_title_' + dataSeed + '_slot_' + column.key"
              :column="slotTitleColumns.find((f) => column.key && f.field === column.key)!"
            />
          </template>
          <template v-if="slotDefaultColumns.length > 0" #bodyCell="{ column, record, index }">
            <render-default-slots
              v-if="slotDefaultColumns.some((s) => column.key && s.field === column.key)"
              :key="renderTableKey + '_cell_' + dataSeed + '_slot_' + column.key"
              :column="slotDefaultColumns.find((f) => column.key && f.field === column.key)!"
              :default-handler="{ pick: pickRow, setLoadings }"
              :row="record"
              :row-index="index"
              :table-data="tableData as Recordable[]"
            />
          </template>
        </a-table>
      </div>
    </template>
  </div>
</template>
