<script
  lang="ts"
  setup
  generic="D extends Recordable = Recordable, F extends Recordable = Recordable"
  name="PCanvasGrid"
>
  import {
    CanvasColumnProps,
    PCanvasGridProps,
    PCanvasTableInstance,
    PFormItemProps,
    ResponsePathConfig,
  } from '#/antProxy';
  import PFormCol from '@/components/PFormCol.vue';
  import { $confirm, $error, $success, $warning } from '@/hooks/useMessage';
  import Icon from '@/renders/Icon';
  import {
    createAutoViewportBoxController,
    parseAutoViewportBoxOffset,
    type AutoViewportBoxController,
    type AutoViewportBoxOffsetInput,
  } from '@/utils/autoViewportBox';
  import { getCanvasTableDefaults, getGridDefaults } from '@/utils/config';
  import { defaultLabelCol } from '@/utils/core';
  import { isGoodValue } from '@/utils/is';
  import { eachTree } from '@/utils/treeHelper';
  import { DownOutlined } from '@ant-design/icons-vue';
  import {
    Button as AButton,
    Form as AForm,
    Pagination as APagination,
    Row as ARow,
    Spin as ASpin,
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
  import { debounce, get, isBoolean, isFunction, isObject, isString, omit, uniq } from 'xe-utils';
  import PCanvasTable from './PCanvasTable.vue';
  const props = withDefaults(defineProps<PCanvasGridProps<D, F>>(), {
    lazyReset: () => getGridDefaults().lazyReset ?? false,
    fitHeight: () => getGridDefaults().fitCanvasHeight ?? 0,
    autoBoxSize: false,
  });
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
    (
      event: 'sortChange',
      value: Map<string, { direction: 'asc' | 'desc' | 'none'; timestamp: number }>,
    ): void;
  }>();

  const handleSortChange = (
    sortState: Map<string, { direction: 'asc' | 'desc' | 'none'; timestamp: number }>,
  ) => {
    emit('sortChange', sortState);
  };

  const { formConfig, pageConfig, columns, toolbarConfig, proxyConfig, config, staticConfig } =
    toRefs(props);
  const canvasTableDefaults = getCanvasTableDefaults();

  /** 局部 `autoBoxSizeOffset` 优先，否则用 `getGridDefaults().autoBoxSizeOffset`（`setUIKitConfig`） */
  const resolvedAutoBoxSizeOffset = computed<AutoViewportBoxOffsetInput>(() => {
    const local = props.autoBoxSizeOffset;
    if (local !== undefined && local !== null) {
      return local;
    }
    return getGridDefaults().autoBoxSizeOffset as AutoViewportBoxOffsetInput;
  });
  const renderFormKey = ref(uuid_v4());
  const queryFormData = ref<Partial<F>>({}) as Ref<Partial<F>>;

  // 只处理 config 的合并，其他属性通过 withDefaults 处理
  // border / scrollbarMode / scrollbarShowDelay 为提升到组件的配置，显式传入时覆盖 config 同名字段
  const propsWithDefaults = computed(() => ({
    ...props,
    config: {
      ...canvasTableDefaults,
      ...props.config,
      ...(props.border !== undefined ? { BORDER: props.border } : {}),
      ...(props.scrollbarMode !== undefined ? { scrollbarMode: props.scrollbarMode } : {}),
      ...(props.scrollbarShowDelay !== undefined
        ? { SCROLLBAR_SHOW_DELAY: props.scrollbarShowDelay }
        : {}),
    },
  }));
  const mode = computed<'list' | 'pagination' | 'bad'>(() =>
    proxyConfig.value && proxyConfig.value.ajax
      ? pageConfig.value
        ? 'pagination'
        : 'list'
      : 'bad',
  );
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
  // 必须用 .value：模板里 pageConfig?.pageSizes 会因可选链绕过 Ref 解包，读到 undefined
  const pageSizeOptions = computed(() =>
    (pageConfig.value?.pageSizes ?? [10, 20, 50, 100, 200]).map(String),
  );

  const fc = computed(() => omit({ labelCol: defaultLabelCol, ...formConfig.value }, ['items']));
  const loading = reactive({
    toolbar: false,
    form: false,
    table: false,
  });
  const pagination = reactive<IPage>({
    page: 1,
    size: pageConfig.value?.pageSize ?? 10,
  });
  const dataSeed = ref(0);
  const totalCount = ref(0);
  const tableData = ref<D[]>([]) as Ref<D[]>;
  const formEl = ref<InstanceType<typeof AForm>>();
  const canvasTableRef = ref<PCanvasTableInstance<D>>();
  const boxEl = ref<HTMLDivElement>();
  const pFormWrapper = ref<HTMLDivElement>();
  const tableWrapperEl = ref<HTMLDivElement>();
  const tableBodyEl = ref<HTMLDivElement>();
  const tableFooterEl = ref<HTMLDivElement>();
  const renderHeight = ref(500);
  /* 分页时缓存的跨页选择数据,风险：数据可能会更新导致串页，读取计算的时候要去重 */
  const pageSelections = ref<{
    [key: number]: D[];
  }>({});
  const handleSelectionChange = (selection: D[]) => {
    pageSelections.value[pagination.page] = selection;
  };

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
  const setLoadings = (value: boolean | Record<string, boolean>) => {
    if (isObject(value)) {
      /* 判断value的toolbar和form 有则更新loading对应值，再判断value的table字段，有则canvasTableRef.value.setLoading*/
      if (Object.prototype.hasOwnProperty.call(value, 'toolbar')) {
        loading.toolbar = value.toolbar;
      }
      if (Object.prototype.hasOwnProperty.call(value, 'form')) {
        loading.form = value.form;
      }
      if (Object.prototype.hasOwnProperty.call(value, 'table')) {
        loading.table = value.table;
      }
    } else if (isBoolean(value)) {
      loading.form = value;
      loading.toolbar = value;
      loading.table = value;
    }
  };
  const selectedRecords = computed<D[]>(() =>
    uniq(
      Object.values(pageSelections.value).flat(),
      (f) => f[propsWithDefaults.value.config?.ROW_KEY ?? 'id'] as string | number,
    ),
  );
  const handleFormSubmit = () => {
    resetPage();
  };
  const selectedRowKeys = computed<Array<string | number>>(() =>
    selectedRecords.value.map(
      (f) => f[propsWithDefaults.value.config?.ROW_KEY ?? 'id'] as string | number,
    ),
  );
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

  const fetchData = () =>
    new Promise<D[]>((resolve) => {
      if (mode.value !== 'bad') {
        setLoadings({ table: true, form: true });
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
                $warning(message);
              }
            }
            resolve(tableData.value as D[]);
          })
          .catch((e) => {
            console.error('fetchData error', e);
            resolve([] as D[]);
          })
          .finally(() => {
            setLoadings({ table: false, form: false });
          });
      }
    });
  const handleTableChange = (current: number, pageSize: number) => {
    pagination.page = current;
    pagination.size = pageSize;
    return fetchData();
  };
  /** 清空跨页缓存 + e-virt 勾选 UI（仅清 pageSelections 会导致「看起来还勾着但 selectedKeys 已空」） */
  const clearSelection = () => {
    pageSelections.value = {};
    canvasTableRef.value?.clearSelection?.();
  };
  const resetPage = () => {
    pagination.page = 1;
    clearSelection();
    return fetchData().then((rows) => {
      // loadData 后勾选态可能残留，再清一次
      clearSelection();
      return rows;
    });
  };
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
              setLoadings({ table: true, toolbar: true });
              ajax.multiDelete!(selectedRowKeys.value)
                .then(() => {
                  $success('删除成功');
                  resetPage();
                })
                .catch(() => {
                  $error('删除失败');
                })
                .finally(() => {
                  setLoadings({ table: false, toolbar: false });
                  codeLoadings.multiDelete = false;
                });
            });
          } else {
            $warning('请选择要删除的数据');
          }
        }
        break;
    }
  };
  const finalColumns = computed<CanvasColumnProps<D>[]>(() => {
    if (!staticConfig.value || (!staticConfig.value.selectable && !staticConfig.value.tree)) {
      return columns.value;
    }
    const firstColumn: CanvasColumnProps<D> =
      staticConfig.value.selectable && staticConfig.value.tree
        ? {
            type: 'selection-tree',
            width: 40,
            widthFillDisable: true,
            title: '',
          }
        : staticConfig.value.selectable
          ? {
              type: 'selection',
              width: 40,
              widthFillDisable: true,
              title: '',
            }
          : staticConfig.value.tree
            ? {
                type: 'tree',
                width: 40,
                widthFillDisable: true,
                title: '',
              }
            : {
                type: 'index',
                width: 40,
                widthFillDisable: true,
                title: '',
              };
    return [firstColumn, ...columns.value];
  });
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
  const reload = () => {
    clearSelection();
    return resetQueryFormData();
  };

  const renderContent = (content: string | (() => any)) => {
    if (isFunction(content)) {
      return content();
    }
    return content;
  };
  const isStringContent = (content: any) => isString(content);

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
  const resizeTable = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      if (!tableBodyEl.value) return;
      const bodyH = tableBodyEl.value.clientHeight;
      const reserve = props.fitHeight ?? 0;
      renderHeight.value = Math.max(bodyH - reserve, 100);
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

  // 分页/已选区域高度变化时重算
  watch(mode, () => nextTick(() => resizeTable()));

  let observer: MutationObserver;
  let boxElResizeObserver: ResizeObserver | null = null;
  let tableBodyResizeObserver: ResizeObserver | null = null;
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
    // 直接观察实际承载 canvas 的内层盒子，避免 padding/footer 干扰
    tableBodyResizeObserver = new ResizeObserver(() => resizeTable());
    if (tableBodyEl.value) {
      tableBodyResizeObserver.observe(tableBodyEl.value);
    }
    resetQueryFormData(props.manualFetch);
    nextTick(() => {
      if (props.autoBoxSize) syncAutoViewportBox();
      resizeTable();
    });
  });
  onBeforeUnmount(() => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    window.removeEventListener('resize', resizeTable);
    observer.disconnect();
    formWrapperResizeObserver?.disconnect();
    boxElResizeObserver?.disconnect();
    tableBodyResizeObserver?.disconnect();
    clearAutoViewportBox();
  });
  defineExpose({
    commitProxy: {
      query: debounceFetchData,
      reload,
      reloadPage: resetPage,
      passQuery,
      forcePassQuery,
    },
    $canvasTable: computed(() => canvasTableRef.value),
    selectedRowKeys,
    setBtnLoading,
    selectedRecords,
    clearSelection,
    $form: computed(() => formEl.value),
    getFormData: () => queryFormData.value,
    setLoadings,
    resizeTable,
  });
</script>
<template>
  <div
    ref="boxEl"
    :class="[
      'p-wrapper flex flex-col gap-8px overflow-y-auto',
      autoBoxSize ? 'min-h-0 min-w-0 flex-1 w-full' : 'h-full',
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
        class="p-canvas-toolbar-wrapper flex items-center w-full justify-between p-theme-bg pt-8px px-16px"
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
      <div ref="tableWrapperEl" class="flex-1 h-0 min-h-0 flex flex-col p-inner-scroll">
        <div ref="tableBodyEl" class="flex-1 min-h-0 overflow-hidden">
          <p-canvas-table
            ref="canvasTableRef"
            :columns="finalColumns"
            :config="{
              ...propsWithDefaults.config,
              HEIGHT: renderHeight,
            }"
            :data="tableData"
            :loading="loading.table"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
          >
            <template v-for="(_, name) in $slots" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps"></slot>
            </template>
          </p-canvas-table>
        </div>
        <div ref="tableFooterEl" class="flex-shrink-0">
          <div
            v-if="staticConfig?.selectable && staticConfig.showCount"
            class="w-full text-slate-5 pl-4"
          >
            已选：{{ selectedRowKeys.length }}
          </div>
          <a-pagination
            class="p-canvas-pagination"
            v-if="mode === 'pagination'"
            size="small"
            :current="pagination.page"
            :page-size="pagination.size"
            :page-size-options="pageSizeOptions"
            :show-size-changer="pageConfig?.showSizeChanger ?? true"
            :show-quick-jumper="pageConfig?.showQuickJumper"
            :show-total="(total: number) => `共${total}条数据`"
            :total="totalCount"
            @change="handleTableChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>
