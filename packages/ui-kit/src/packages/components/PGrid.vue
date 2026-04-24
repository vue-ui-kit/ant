<script
  generic="D extends Recordable = Recordable, F extends Recordable = Recordable"
  lang="ts"
  name="PGrid"
  setup
>
  import { ColumnProps, PFormItemProps, PGridProps, ResponsePathConfig } from '#/antProxy';
  import PFormCol from '@/components/PFormCol.vue';
  import RenderDefaultSlots from '@/components/RenderDefaultSlots';
  import RenderTitleSlots from '@/components/RenderTitleSlots';
  import { $confirm } from '@/hooks/useMessage';
  import Icon from '@/renders/Icon';
  import {
    createAutoViewportBoxController,
    parseAutoViewportBoxOffset,
    type AutoViewportBoxController,
    type AutoViewportBoxOffsetInput,
  } from '@/utils/autoViewportBox';
  import { getGridDefaults } from '@/utils/config';
  import { cleanCol, defaultLabelCol } from '@/utils/core';
  import { isGoodValue } from '@/utils/is';
  import { eachTree } from '@/utils/treeHelper';
  import { DownOutlined } from '@ant-design/icons-vue';
  import {
    message as $message,
    Button as AButton,
    Form as AForm,
    Row as ARow,
    Spin as ASpin,
    Table as ATable,
  } from 'ant-design-vue';
  import { v4 as uuid_v4 } from 'uuid';
  import {
    Ref,
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    toRefs,
    useAttrs,
    watch,
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
  } from 'xe-utils';

  const props = withDefaults(defineProps<PGridProps<D, F>>(), {
    rowKey: 'id',
    scrollMode: 'inner',
    align: () => getGridDefaults().align ?? 'left',
    lazyReset: () => getGridDefaults().lazyReset ?? false,
    fitHeight: () => getGridDefaults().fitHeight ?? 30,
    striped: () => getGridDefaults().striped ?? false,
    autoBoxSize: false,
    fitContent: false,
  });

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

  /** 局部 `autoBoxSizeOffset` 优先，否则用 `getGridDefaults().autoBoxSizeOffset`（`setUIKitConfig`） */
  const resolvedAutoBoxSizeOffset = computed<AutoViewportBoxOffsetInput>(() => {
    const local = props.autoBoxSizeOffset;
    if (local !== undefined && local !== null) {
      return local;
    }
    return getGridDefaults().autoBoxSizeOffset as AutoViewportBoxOffsetInput;
  });

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
  const tableWrapperEl = ref<HTMLDivElement>();
  const tableFooterEl = ref<HTMLDivElement>();
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
  const formEl = ref<InstanceType<typeof AForm>>();
  const tableEl = ref<InstanceType<typeof ATable>>();
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
  /** 底部展示「已选」统计（与 multiple 无关，仅看 showCount） */
  const showSelectionCount = computed(() => !!selectConfig.value?.showCount);
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
              obj[item.field as keyof F] = item.itemRender.defaultValue;
            } else {
              obj[item.field as keyof F] = undefined;
            }
          } else if (item.field && item.slots) {
            if (isGoodValue(item.slots.defaultValue)) {
              obj[item.field as keyof F] = item.slots.defaultValue;
            } else {
              obj[item.field as keyof F] = undefined;
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
  const handlePaginationChange = (page: number, pageSize: number) => {
    pagination.page = page;
    pagination.size = pageSize;
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
  const forcePassQuery = (params: Partial<F>, lazy?: boolean) => {
    queryFormData.value = params;
    pagination.page = 1;
    return lazy ? Promise.resolve() : debounceFetchData();
  };
  const defaultTableConfig = {
    size: 'small' as const,
    sticky: true,
    transformCellText: ({ text }: { text: any }) => {
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
  watch(
    () => [renderTableKey.value, dataSeed.value, mode.value, showSelectionCount.value],
    () => nextTick(() => resizeTable()),
    { flush: 'post' },
  );

  let autoViewportBoxCtrl: AutoViewportBoxController | null = null;
  const clearAutoViewportBox = () => {
    autoViewportBoxCtrl?.destroy();
    autoViewportBoxCtrl = null;
  };
  const syncAutoViewportBox = () => {
    clearAutoViewportBox();
    if (!props.autoBoxSize || !boxEl.value) return;
    autoViewportBoxCtrl = createAutoViewportBoxController(
      () => boxEl.value ?? undefined,
      () => parseAutoViewportBoxOffset(resolvedAutoBoxSizeOffset.value),
      {
        onLayout: () => {
          nextTick(() => resizeTable());
        },
      },
    );
    autoViewportBoxCtrl.attach();
  };

  watch(
    () => props.autoBoxSize,
    (on) => {
      if (!on) clearAutoViewportBox();
      else nextTick(() => syncAutoViewportBox());
    },
  );
  watch(
    resolvedAutoBoxSizeOffset,
    () => {
      if (props.autoBoxSize) autoViewportBoxCtrl?.update();
    },
    { deep: true },
  );

  let resizeRaf: number | null = null;

  const resolveTableHeaderEl = (wrapper: HTMLElement): HTMLElement | null => {
    const root = wrapper.querySelector('.ant-table-wrapper');
    if (!root) return null;
    const byHeader = root.querySelector('.ant-table-header') as HTMLElement | null;
    if (byHeader) return byHeader;
    return root.querySelector('.ant-table-thead') as HTMLElement | null;
  };

  const resizeTable = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      if (!tableWrapperEl.value) return;
      if (isGoodValue(props.renderY)) {
        renderHeight.value = props.renderY as number;
        return;
      }
      // 内容撑开模式（弹窗等）：scroll.y 作为上限，内容不足时 a-table-body 按自然高度展示。
      if (props.fitContent) {
        const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
        const reserve = props.fitHeight ?? 30;
        renderHeight.value = Math.max(Math.floor(vh * 0.6) - reserve, 160);
        return;
      }
      const wrapperH = tableWrapperEl.value.clientHeight;
      const footerH = tableFooterEl.value?.offsetHeight ?? 0;
      const tableHeaderEl = resolveTableHeaderEl(tableWrapperEl.value);
      const headerH = tableHeaderEl?.getBoundingClientRect().height ?? 0;
      const reserve = props.fitHeight ?? 30;
      const y = Math.max(wrapperH - footerH - headerH - reserve, 100);
      renderHeight.value = y;
    });
  };

  // 监听表单区域高度变化（响应式布局换行/收起时自动重算）
  let formWrapperResizeObserver: ResizeObserver | null = null;
  watch(
    pFormWrapper,
    (el) => {
      formWrapperResizeObserver?.disconnect();
      formWrapperResizeObserver = null;
      if (!el) return;
      formWrapperResizeObserver = new ResizeObserver(() => resizeTable());
      formWrapperResizeObserver.observe(el);
    },
    { immediate: true },
  );
  defineExpose({
    commitProxy: {
      query: debounceFetchData,
      reload,
      reloadPage: resetPage,
      passQuery,
      forcePassQuery,
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
  let boxElResizeObserver: ResizeObserver | null = null;
  let tableWrapperResizeObserver: ResizeObserver | null = null;
  let tableFooterResizeObserver: ResizeObserver | null = null;
  onMounted(() => {
    resizeTable();
    window.addEventListener('resize', resizeTable);
    // 组件根节点由不可见转为可见时重新计算（display:none 切换场景）
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const el = mutation.target as HTMLElement;
          if (window.getComputedStyle(el).display !== 'none') {
            resizeTable();
          }
        }
      });
    });

    if (boxEl.value) {
      observer.observe(boxEl.value, { attributes: true, attributeFilter: ['style'] });
      // 往上观察多级祖先：父容器可能是内容撑开的，真正因外部兄弟变化而 resize
      // 的元素可能在更高层（如 flex 容器）。观察多层确保能感知到
      boxElResizeObserver = new ResizeObserver(() => resizeTable());
      let ancestor: Element | null = boxEl.value.parentElement;
      for (let i = 0; i < 5 && ancestor && ancestor !== document.body; i++) {
        boxElResizeObserver.observe(ancestor);
        ancestor = ancestor.parentElement;
      }
    }
    tableWrapperResizeObserver = new ResizeObserver(() => resizeTable());
    if (tableWrapperEl.value) {
      tableWrapperResizeObserver.observe(tableWrapperEl.value);
    }
    tableFooterResizeObserver = new ResizeObserver(() => resizeTable());
    if (tableFooterEl.value) {
      tableFooterResizeObserver.observe(tableFooterEl.value);
    }
    resetQueryFormData(props.manualFetch);
    nextTick(() => {
      if (props.autoBoxSize) syncAutoViewportBox();
      resizeTable();
    });
  });
  const renderContent = (content: string | (() => any)) => {
    if (isFunction(content)) {
      return content();
    } else {
      return content;
    }
  };
  const isStringContent = (content: any) => {
    return isString(content);
  };
  const passFields = ['align'];
  const passDefaultColumnProps = (columns: ColumnProps<D>[]) =>
    columns.map((c) => ({
      ...passFields.reduce(
        (prev, cur) => ({
          [cur]: props[cur],
        }),
        {} as ColumnProps<D>,
      ),
      ...c,
    }));
  onBeforeUnmount(() => {
    clearAutoViewportBox();
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    window.removeEventListener('resize', resizeTable);
    observer.disconnect();
    formWrapperResizeObserver?.disconnect();
    boxElResizeObserver?.disconnect();
    tableWrapperResizeObserver?.disconnect();
    tableFooterResizeObserver?.disconnect();
  });
</script>
<template>
  <div
    ref="boxEl"
    :class="[
      'p-wrapper flex flex-col gap-8px',
      fitContent
        ? 'w-full h-auto'
        : autoBoxSize
          ? 'overflow-y-auto min-h-0 min-w-0 flex-1 w-full'
          : 'overflow-y-auto h-full',
    ]"
    v-bind="attrs"
  >
    <div v-if="mode === 'bad'">请检查配置</div>
    <template v-else>
      <div
        v-if="formConfig?.items?.some((s: PFormItemProps<F>) => s.field && s.itemRender)"
        class="p-pane p-form-wrapper"
        ref="pFormWrapper"
      >
        <a-spin :spinning="loading.form">
          <a-form
            :name="formConfig?.name"
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
                @reset="resetQueryFormData(props.lazyReset)"
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
                    <a-menu-item v-for="sub in btn.dropdowns" :key="sub.code">
                      <template v-if="sub.content && isStringContent(renderContent(sub.content))">
                        {{ renderContent(sub.content) }}
                      </template>
                      <component v-else-if="sub.content" :is="renderContent(sub.content)" />
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button
                  :type="btn.type"
                  :size="btn.size ?? 'middle'"
                  :disabled="toolbarConfig.disabled || btn.disabled"
                  :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                  :danger="btn.danger"
                  :shape="btn.shape"
                  :ghost="btn.ghost"
                  :block="btn.block"
                >
                  <div class="flex items-center gap-4px">
                    <Icon v-if="btn.icon" :icon="btn.icon" />
                    <template v-if="btn.content && isStringContent(renderContent(btn.content))">
                      {{ renderContent(btn.content) }}
                    </template>
                    <component v-else-if="btn.content" :is="renderContent(btn.content)" />
                    <DownOutlined />
                  </div>
                </a-button>
              </a-dropdown>
              <a-button
                v-else-if="btn.code"
                :type="btn.type"
                :size="btn.size ?? 'middle'"
                :disabled="toolbarConfig.disabled || btn.disabled"
                :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                :danger="btn.danger"
                :shape="btn.shape"
                :ghost="btn.ghost"
                :block="btn.block"
                @click="debounceToolBtnClick(btn.code)"
              >
                <div class="flex items-center gap-4px">
                  <Icon v-if="btn.icon" :icon="btn.icon" />
                  <template v-if="btn.content && isStringContent(renderContent(btn.content))">
                    {{ renderContent(btn.content) }}
                  </template>
                  <component v-else-if="btn.content" :is="renderContent(btn.content)" />
                </div>
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
              :danger="tool.danger"
              :shape="tool.shape"
              :ghost="tool.ghost"
              :block="tool.block"
              @click="debounceToolToolClick(tool.code)"
              :loading="loading.toolbar || (!!tool.code && codeLoadings[tool.code])"
            >
              <div class="flex items-center gap-4px">
                <Icon v-if="tool.icon" :icon="tool.icon" />
                <template v-if="tool.content && isStringContent(renderContent(tool.content))">
                  {{ renderContent(tool.content) }}
                </template>
                <component v-else-if="tool.content" :is="renderContent(tool.content)" />
              </div>
            </a-button>
          </template>
        </span>
      </div>
      <div
        ref="tableWrapperEl"
        :class="
          fitContent
            ? 'p-pane'
            : `p-pane flex-1 h-0 min-h-0 flex flex-col p-${scrollMode ?? 'inner'}-scroll`
        "
      >
        <div
          :class="
            fitContent ? 'p-grid-table-body' : 'p-grid-table-body flex-1 min-h-0 overflow-hidden'
          "
        >
          <a-table
            :key="renderTableKey + '_table'"
            :row-key="rowKey ?? 'id'"
            ref="tableEl"
            :row-class-name="
              striped ? (_record, index) => (index % 2 === 1 ? 'p-grid-row-striped' : '') : ''
            "
            :columns="passDefaultColumnProps(columns ?? []).map((c) => cleanCol(c as ColumnProps))"
            :data-source="tableData"
            :loading="loading.table"
            :pagination="false"
            v-bind="tc"
            :scroll="{
              x: 'max-content',
              y: renderHeight,
            }"
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
        <div ref="tableFooterEl" class="flex-shrink-0">
          <div
            v-if="mode !== 'pagination' && showSelectionCount"
            class="w-full pt-8px px-16px text-slate-5"
          >
            已选：{{ selectedRowKeys.length }}
          </div>
          <div
            v-else-if="mode === 'pagination'"
            class="flex w-full items-center gap-12px pt-8px px-16px"
          >
            <div class="flex-1 min-w-0 text-slate-5 flex items-center">
              <template v-if="showSelectionCount"> 已选：{{ selectedRowKeys.length }} </template>
            </div>
            <a-pagination
              size="small"
              :responsive="false"
              :show-size-changer="true"
              :show-total="(total: number) => `共${total}条数据`"
              :current="pagination.page"
              :page-size="pagination.size"
              :total="totalCount"
              @change="handlePaginationChange"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
