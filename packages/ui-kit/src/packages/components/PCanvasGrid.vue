<template>
  <div ref="boxEl" class="p-canvas-grid">
    <ASpin :spinning="loading.form || loading.table || loading.toolbar">
      <!-- 查询表单 -->
      <div v-if="formConfig" ref="pFormWrapper" class="p-canvas-grid__form">
        <AForm
          ref="formEl"
          :key="renderFormKey"
          :model="queryFormData"
          :label-col="formConfig.labelCol ?? defaultLabelCol"
          class="p-canvas-grid__form-inner"
        >
          <ARow :gutter="16">
            <PFormCol
              v-for="item in formConfig.items"
              :key="item.field"
              :item="item"
              :formData="queryFormData"
              v-model:value="queryFormData[item.field!]"
              :loading="loading.form"
              @submit="handleFormSubmit"
            />
            <PFormCol
              v-if="formConfig.items && formConfig.items.length > 0"
              :item="{ span: formConfig.actionSpan ?? 6 }"
              :formData="queryFormData"
              class="p-canvas-grid__form-actions"
            >
              <AButton type="primary" :loading="loading.form" @click="handleFormSubmit">
                <Icon icon="SearchOutlined" />
                查询
              </AButton>
              <AButton :loading="loading.form" @click="() => resetQueryFormData()">
                <Icon icon="ReloadOutlined" />
                重置
              </AButton>
            </PFormCol>
          </ARow>
        </AForm>
      </div>

      <!-- 工具栏 -->
      <div v-if="toolbarConfig" class="p-canvas-grid__toolbar">
        <div class="p-canvas-grid__toolbar-left">
          <template v-if="toolbarConfig.buttons">
            <AButton
              v-for="btn in toolbarConfig.buttons"
              :key="btn.code"
              :type="btn.type ?? 'default'"
              :loading="codeLoadings[btn.code!]"
              @click="toolBtnClick(btn.code!)"
            >
              <Icon v-if="btn.icon" :icon="btn.icon" />
              {{ btn.content }}
            </AButton>
          </template>
        </div>
        <div class="p-canvas-grid__toolbar-right">
          <template v-if="toolbarConfig.tools">
            <AButton
              v-for="tool in toolbarConfig.tools"
              :key="tool.code"
              :type="tool.type ?? 'default'"
              :loading="codeLoadings[tool.code!]"
              @click="toolToolClick(tool.code!)"
            >
              <Icon v-if="tool.icon" :icon="tool.icon" />
              {{ tool.code }}
            </AButton>
          </template>
        </div>
      </div>

      <!-- 选中信息 -->
      <div v-if="selectedRowKeys.length > 0" class="p-canvas-grid__selection-info">
        已选中 {{ selectedRowKeys.length }} 项
      </div>

      <!-- Canvas表格容器 -->
      <div
        ref="tableContainer"
        class="p-canvas-grid__table"
        :style="{ height: renderHeight + 'px' }"
      >
        <!-- e-virt-table将在这里初始化 -->
      </div>

      <!-- 分页 -->
      <div v-if="mode === 'pagination'" class="p-canvas-grid__pagination">
        <APagination
          v-model:current="pagination.page"
          v-model:page-size="pagination.size"
          :total="totalCount"
          :show-size-changer="pageConfig?.showSizeChanger ?? true"
          :show-quick-jumper="pageConfig?.showQuickJumper ?? true"
          :show-total="(total, range) => `共 ${total} 条记录`"
          @change="handleTableChange"
          @show-size-change="handleTableChange"
        />
      </div>
    </ASpin>
  </div>
</template>

<script generic="D = Recordable, F = Recordable" lang="ts" name="PCanvasGrid" setup>
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
    nextTick,
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
  import { v4 as uuid_v4 } from 'uuid';
  import { isGoodValue } from '@/utils/is';
  import PFormCol from '@/components/PFormCol.vue';
  import { defaultLabelCol } from '@/utils/core';
  import { getGridDefaults } from '@/utils/config';
  import Icon from '@/renders/Icon';
  import { $confirm } from '@/hooks/useMessage';
  import {
    Button as AButton,
    Form as AForm,
    Row as ARow,
    Spin as ASpin,
    Dropdown as ADropdown,
    Menu as AMenu,
    MenuItem as AMenuItem,
    Pagination as APagination,
  } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  // @ts-ignore
  import EVirtTable from 'e-virt-table';

  const props = defineProps<PGridProps<D, F>>();

  const gridDefaults = getGridDefaults();
  const propsWithDefaults = computed(() => ({
    ...props,
    rowKey: props.rowKey ?? 'id',
    align: props.align ?? gridDefaults.align ?? 'left',
    lazyReset: props.lazyReset ?? gridDefaults.lazyReset ?? false,
    fitHeight: props.fitHeight ?? gridDefaults.fitHeight ?? 170,
  }));

  const { formConfig, pageConfig, columns, toolbarConfig, proxyConfig, tableConfig } =
    toRefs(props);

  // 状态管理
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
  const tableContainer = ref<HTMLElement>();
  let virtTableInstance: any = null;

  const formEl = ref();
  const renderFormKey = ref(uuid_v4());
  const queryFormData = ref<F>({} as F);
  const tableData = ref<D[]>([]) as Ref<D[]>;

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

  const pagination = reactive({
    page: 1,
    size: pageConfig.value?.pageSize ?? 100,
  });
  const totalCount = ref(0);

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

  const selectedRecords = computed<D[]>(() =>
    selectedCaches.value.filter((f) =>
      selectedRowKeys.value.includes(f[props.rowKey ?? 'id'] as string | number),
    ),
  );

  // 处理选择变化
  const handleSelectionChange = (rows: D[]) => {
    selectedCaches.value = rows;
    selectedRowKeys.value = rows.map((row) => row[propsWithDefaults.value.rowKey as keyof D]) as (
      | string
      | number
    )[];
  };

  // 工具栏按钮点击
  const toolBtnClick = debounce((code: string) => {
    setBtnLoading(code, true);

    // 内置处理
    if (code === 'multiDelete') {
      innerToolbarHandler(code);
      return;
    }

    emit('toolbarButtonClick', {
      data: tableData.value,
      code,
      selectedKeys: selectedRowKeys.value,
      records: selectedRecords.value,
    });
    setBtnLoading(code, false);
  }, 300);

  // 工具栏工具点击
  const toolToolClick = debounce((code: string) => {
    setBtnLoading(code, true);
    emit('toolbarToolClick', {
      data: tableData.value,
      code,
      selectedKeys: selectedRowKeys.value,
      records: selectedRecords.value,
    });
    setBtnLoading(code, false);
  }, 300);

  // 内置工具栏处理
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

  // 重置查询表单
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
        queryFormData.value = obj as F;
      }
      emit('resetQuery');
    }

    pagination.page = 1;
    if (!lazy) {
      fetchData();
    }
  };

  // 处理响应数据
  const handleResponse = (response: any, pathConfig?: ResponsePathConfig<D>) => {
    const result = pathConfig
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

    if (result.list) {
      tableData.value = result.list as D[];
      totalCount.value = result.total ?? result.list.length;
    } else if (result.result) {
      tableData.value = result.result as D[];
      totalCount.value = result.total ?? result.result.length;
    } else {
      tableData.value = [];
      if (result.message) {
        $message.warn(result.message);
      }
    }

    // 更新e-virt-table数据
    if (virtTableInstance) {
      virtTableInstance.loadData(tableData.value);
    }
  };

  // 重新加载数据
  const reload = () => {
    fetchData();
  };

  // 重置页码并加载
  const resetPage = () => {
    pagination.page = 1;
    fetchData();
  };

  // 处理表格变化（分页）
  const handleTableChange = (page?: number, pageSize?: number) => {
    if (page) pagination.page = page;
    if (pageSize) pagination.size = pageSize;
    fetchData();
  };

  // 处理表单提交
  const handleFormSubmit = () => {
    pagination.page = 1;
    fetchData();
  };

  // 设置按钮加载状态
  const setBtnLoading = (code: string, loading: boolean) => {
    codeLoadings[code] = loading;
  };

  // 设置多个按钮加载状态
  const setBtnLoadings = (loadings: Record<string, boolean>) => {
    Object.assign(codeLoadings, loadings);
  };

  // 获取数据
  const fetchData = async () => {
    if (!proxyConfig.value?.ajax?.query) return;

    try {
      loading.table = true;
      loading.form = true;
      const params = {
        form: queryFormData.value,
        page: pagination,
      };

      const response = await proxyConfig.value.ajax.query(params);
      handleResponse(response, proxyConfig.value.response);
    } catch (error) {
      console.error('获取数据失败:', error);
      $message.error('获取数据失败');
    } finally {
      loading.table = false;
      loading.form = false;
    }
  };

  // 传递查询参数
  const passQuery = () => {
    if (mode.value === 'pagination') {
      return {
        page: pagination.page,
        size: pagination.size,
      };
    }
    return {};
  };

  // 初始化e-virt-table
  const initVirtTable = () => {
    if (!tableContainer.value) return;

    // 转换列配置为e-virt-table格式
    const virtColumns =
      columns.value?.map((col: ColumnProps) => ({
        key: col.field || col.dataIndex,
        title: col.title,
        width: col.width || 120,
        align: col.align || 'left',
        readonly: true, // 默认只读
      })) || [];

    // 如果有选择配置，添加选择列
    if (tableConfig.value?.rowSelection) {
      virtColumns.unshift({
        type: 'checkbox',
        width: 50,
        align: 'center',
      });
    }

    // 初始化e-virt-table实例 - 使用正确的构造函数参数
    virtTableInstance = new EVirtTable(tableContainer.value, {
      data: tableData.value,
      columns: virtColumns,
      config: {
        ENABLE_SELECTOR: tableConfig.value?.rowSelection ? true : false,
        ENABLE_SELECTOR_SINGLE: tableConfig.value?.rowSelection?.type === 'radio',
      },
    });

    // 监听选择变化事件
    if (tableConfig.value?.rowSelection && virtTableInstance.on) {
      virtTableInstance.on('selectionChange', (selectedRows: D[]) => {
        handleSelectionChange(selectedRows);
      });
    }
  };

  // 计算渲染高度
  const calculateHeight = () => {
    if (!boxEl.value) return;

    const boxHeight = boxEl.value.clientHeight;
    const formHeight = pFormWrapper.value?.clientHeight || 0;
    const toolbarHeight = 50; // 工具栏高度
    const paginationHeight = mode.value === 'pagination' ? 50 : 0;
    const padding = 20;

    renderHeight.value = Math.max(
      boxHeight - formHeight - toolbarHeight - paginationHeight - padding,
      propsWithDefaults.value.fitHeight,
    );
  };

  // 监听数据变化
  watch(
    () => tableData.value,
    (newData) => {
      if (virtTableInstance) {
        virtTableInstance.loadData(newData);
      }
    },
    { deep: true },
  );

  // 监听高度变化 - e-virt-table 会自动适应容器高度，无需手动更新
  watch(
    () => renderHeight.value,
    () => {
      // e-virt-table 会自动检测容器尺寸变化
      // 如果需要强制重新计算，可以触发 resize 事件
      if (virtTableInstance && tableContainer.value) {
        window.dispatchEvent(new Event('resize'));
      }
    },
  );

  // 组件挂载
  onMounted(async () => {
    await nextTick();
    calculateHeight();
    initVirtTable();

    // 监听窗口大小变化
    window.addEventListener('resize', calculateHeight);

    // 初始化查询表单并加载数据
    resetQueryFormData(props.manualFetch);
  });

  // 组件卸载
  onBeforeUnmount(() => {
    window.removeEventListener('resize', calculateHeight);
    if (virtTableInstance) {
      virtTableInstance.destroy?.();
      virtTableInstance = null;
    }
  });

  // 暴露方法
  defineExpose({
    commitProxy: {
      query: fetchData,
      reload,
      reloadPage: resetPage,
      passQuery: (params: Partial<F>, lazy?: boolean) => {
        Object.assign(queryFormData.value, params);
        pagination.page = 1;
        return lazy ? Promise.resolve() : fetchData();
      },
    },
    selectedRowKeys: computed(() => selectedRowKeys.value),
    setBtnLoading,
    selectedRecords,
    $form: computed(() => formEl.value),
    getFormData: () => queryFormData.value,
    setBtnLoadings,
    resizeTable: calculateHeight,
    getSelectedRows: () => selectedRecords.value,
    getSelectedKeys: () => selectedRowKeys.value,
    clearSelection: () => {
      selectedRowKeys.value = [];
      selectedCaches.value = [];
      if (virtTableInstance) {
        virtTableInstance.clearSelection?.();
      }
    },
  });
</script>

<style scoped>
  .p-canvas-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .p-canvas-grid__form {
    margin-bottom: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
  }

  .p-canvas-grid__form-inner {
    margin-bottom: 0;
  }

  .p-canvas-grid__form-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .p-canvas-grid__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px 0;
  }

  .p-canvas-grid__toolbar-left,
  .p-canvas-grid__toolbar-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .p-canvas-grid__selection-info {
    margin-bottom: 8px;
    padding: 8px 12px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    color: #1890ff;
    font-size: 14px;
  }

  .p-canvas-grid__table {
    flex: 1;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
  }

  .p-canvas-grid__pagination {
    margin-top: 16px;
    text-align: right;
  }
</style>
