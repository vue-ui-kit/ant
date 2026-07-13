<script setup lang="tsx">
  import { computed, h, ref } from 'vue';
  import { queryStudents } from '../Mock/apis/school';
  import { PCanvasGridProps, labelColDict, getButtonResponsive } from '@vue-ui-kit/ant';
  import {
    Card as ACard,
    Button as AButton,
    Space as ASpace,
    Tag as ATag,
    message,
  } from 'ant-design-vue';
  import { UserOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons-vue';

  interface IPage {
    page: number;
    size: number;
  }

  const demoMode = ref<'adaptive' | 'autoBoxSize'>('adaptive');
  const selectedRecords = ref<any[]>([]);
  const headerExpanded = ref(false);
  const sidebarExpanded = ref(false);

  // ── 自适应容器高度模式 ──
  const studentsGridSetting = computed<
    PCanvasGridProps<any, { keyword?: string; grade?: string } & IPage>
  >(() => ({
    columns: [
      {
        field: 'name',
        width: 120,
        title: '姓名',
        slots: {
          title: ({ column }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>{column.title}</span>
            </div>
          ),
          default: ({ row }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>{row.name}</span>
            </div>
          ),
        },
      },
      {
        field: 'age',
        width: 80,
        title: '年龄',
        cellRender: {
          name: '$number',
          props: { disabled: true },
        },
      },
      {
        field: 'grade',
        width: 100,
        title: '年级',
        slots: { default: 'grade' } as any,
      },
      {
        field: 'score',
        width: 100,
        title: '成绩',
        sortBy: 'number',
        slots: {
          default: ({ row }) => (
            <span
              style={{
                color: row.score >= 90 ? '#52c41a' : row.score >= 60 ? '#faad14' : '#ff4d4f',
              }}
            >
              {row.score}
            </span>
          ),
        },
      },
      {
        field: 'address',
        minWidth: 200,
        title: '地址',
      },
    ],
    formConfig: {
      items: [
        {
          field: 'keyword',
          title: '关键字',
          labelCol: labelColDict[3],
          itemRender: {
            name: '$input',
            props: { placeholder: '请输入姓名或地址' },
          },
        },
        {
          field: 'grade',
          title: '年级',
          labelCol: labelColDict[2],
          itemRender: {
            name: '$select',
            props: {
              placeholder: '请选择年级',
              allowClear: true,
              options: [
                { label: '一年级', value: '一年级' },
                { label: '二年级', value: '二年级' },
                { label: '三年级', value: '三年级' },
                { label: '四年级', value: '四年级' },
                { label: '五年级', value: '五年级' },
                { label: '六年级', value: '六年级' },
              ],
            },
          },
        },
        {
          col: getButtonResponsive(2),
          align: 'right',
          itemRender: {
            name: '$buttons',
            children: [
              { props: { content: '查询', htmlType: 'submit', type: 'primary' } },
              { props: { content: '重置', htmlType: 'reset' } },
            ],
          },
        },
      ],
    },
    pageConfig: { pageSize: 50 },
    staticConfig: { multiple: true, selectable: true },
    toolbarConfig: {
      buttons: [
        {
          type: 'primary',
          code: 'add',
          content: '新增',
          icon: 'PlusOutlined',
        },
        {
          type: 'default',
          code: 'edit',
          content: () => '编辑',
          icon: 'EditOutlined',
        },
        {
          type: 'default',
          code: 'delete',
          content: '删除',
          icon: 'DeleteOutlined',
          danger: true,
        },
        {
          type: 'default',
          code: 'export',
          content: () =>
            h('span', { style: { color: '#1890ff' } }, [
              h(DownloadOutlined, { style: { marginRight: '4px' } }),
              '导出',
            ]),
        },
        {
          type: 'default',
          code: 'dropdown',
          content: '批量操作',
          dropdowns: [
            { code: 'batchEdit', content: '批量编辑' },
            {
              code: 'batchExport',
              content: () =>
                h('span', { style: { color: '#52c41a' } }, [
                  h(StarOutlined, { style: { marginRight: '4px' } }),
                  '批量导出',
                ]),
            },
          ],
        },
      ],
      tools: [
        {
          code: 'refresh',
          content: '刷新',
          icon: 'ReloadOutlined',
        },
        {
          code: 'dynamicTool',
          content: () => h('span', { style: { fontWeight: 'bold' } }, '动态工具'),
        },
      ],
    },
    proxyConfig: {
      response: { result: 'list', total: 'total' },
      ajax: {
        query: ({ form, page }) =>
          queryStudents({ ...form, ...page } as IPage & { keyword?: string; grade?: string }),
      },
    },
    config: {
      SELECTABLE_METHOD: ({ row }) => row.age > 18,
      ENABLE_AUTOFILL: true,
      AUTO_ROW_HEIGHT: true,
    },
    // 边框 / 内部悬停滚动条（亦可写在 config.BORDER / config.scrollbarMode）
    border: 'default',
    scrollbarMode: 'inner',
  }));

  // ── autoBoxSize 模式：自动贴底 ──
  const responsiveGridSetting = computed<PCanvasGridProps<any, { keyword?: string } & IPage>>(
    () => ({
      autoBoxSize: true,
      autoBoxSizeOffset: { bottom: 0 },
      columns: [
        { field: 'name', width: 120, title: '姓名' },
        { field: 'age', width: 80, title: '年龄' },
        { field: 'grade', width: 100, title: '年级' },
        {
          field: 'score',
          width: 100,
          title: '成绩',
          slots: {
            default: ({ row }) => (
              <span
                style={{
                  color: row.score >= 90 ? '#52c41a' : row.score >= 60 ? '#faad14' : '#ff4d4f',
                }}
              >
                {row.score}
              </span>
            ),
          },
        },
        { field: 'address', minWidth: 200, title: '地址' },
      ],
      formConfig: {
        items: [
          {
            field: 'keyword',
            title: '关键字',
            labelCol: labelColDict[3],
            itemRender: {
              name: '$input',
              props: { placeholder: '请输入关键字' },
            },
          },
          {
            col: getButtonResponsive(1),
            align: 'right',
            itemRender: {
              name: '$buttons',
              children: [
                { props: { content: '查询', htmlType: 'submit', type: 'primary' } },
                { props: { content: '重置', htmlType: 'reset' } },
              ],
            },
          },
        ],
      },
      pageConfig: { pageSize: 20 },
      toolbarConfig: {
        buttons: [{ type: 'primary', code: 'add', content: '新增', icon: 'PlusOutlined' }],
        tools: [{ code: 'refresh', content: '刷新', icon: 'ReloadOutlined' }],
      },
      proxyConfig: {
        response: { result: 'list', total: 'total' },
        ajax: {
          query: ({ form, page }) =>
            queryStudents({ ...form, ...page } as IPage & { keyword?: string }),
        },
      },
    }),
  );

  const handleToolbarBtn = ({ code, records }: { code: string; records: any[] }) => {
    selectedRecords.value = records;
    const msgs: Record<string, string> = {
      add: '新增学生成功',
      edit: '编辑学生成功',
      delete: `删除 ${records.length} 条记录成功`,
      export: '导出学生数据成功',
      batchEdit: '批量编辑成功',
      batchExport: '批量导出成功',
      refresh: '刷新成功',
      dynamicTool: '动态工具触发',
    };
    if (msgs[code]) message.success(msgs[code]);
  };
</script>

<template>
  <!-- ── 自适应容器高度模式 ── -->
  <div v-if="demoMode === 'adaptive'" style="display: flex; flex-direction: column; height: 100%">
    <a-space style="margin-bottom: 16px; flex-shrink: 0">
      <a-button type="primary" disabled>自适应容器高度（当前）</a-button>
      <a-button @click="demoMode = 'autoBoxSize'">自动贴底（autoBoxSize）</a-button>
    </a-space>

    <a-card
      title="PCanvasGrid – 自适应容器高度"
      style="flex: 1; min-height: 0; display: flex; flex-direction: column"
      :body-style="{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
      }"
    >
      <p style="margin-bottom: 8px; color: #888; font-size: 12px; flex-shrink: 0">
        Canvas 表格高度自动填充容器剩余空间，表单换行/收起、分页区域高度变化时实时重算。
      </p>
      <div style="flex: 1; min-height: 0">
        <p-canvas-grid
          v-bind="studentsGridSetting"
          @toolbar-button-click="handleToolbarBtn"
          @toolbar-tool-click="handleToolbarBtn"
        >
          <template #grade="{ row }">
            <a-tag color="blue">{{ row.grade }}</a-tag>
          </template>
        </p-canvas-grid>
      </div>
    </a-card>

    <a-card
      title="操作记录"
      v-if="selectedRecords.length > 0"
      style="margin-top: 16px; flex-shrink: 0"
    >
      <p>已选择 {{ selectedRecords.length }} 条记录：</p>
      <ul>
        <li v-for="(record, index) in selectedRecords.slice(0, 5)" :key="index">
          {{ record.name }}
        </li>
        <li v-if="selectedRecords.length > 5">... 还有 {{ selectedRecords.length - 5 }} 条记录</li>
      </ul>
    </a-card>
  </div>

  <!-- ── autoBoxSize 自动贴底模式 ── -->
  <div v-else style="display: flex; flex-direction: column; height: 100%">
    <!-- 可变高度顶部栏 -->
    <div
      :style="{
        height: headerExpanded ? '100px' : '40px',
        background: 'var(--p-border-light-color, #f0f0f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        transition: 'height 0.3s ease',
        flexShrink: 0,
      }"
    >
      <span style="font-size: 12px; color: #888">
        顶部占位容器（{{ headerExpanded ? '展开 100px' : '收起 40px' }}）
      </span>
      <a-space>
        <a-button size="small" @click="headerExpanded = !headerExpanded">
          {{ headerExpanded ? '收起' : '展开' }}高度
        </a-button>
        <a-button size="small" @click="demoMode = 'adaptive'">← 返回容器自适应模式</a-button>
      </a-space>
    </div>

    <!-- 主体：侧边栏 + 画布表格 -->
    <div style="display: flex; flex: 1; min-height: 0">
      <!-- 可变宽度侧边栏 -->
      <div
        :style="{
          width: sidebarExpanded ? '200px' : '50px',
          background: '#fafafa',
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'width 0.3s ease',
          cursor: 'pointer',
          fontSize: '12px',
          color: '#888',
        }"
        @click="sidebarExpanded = !sidebarExpanded"
      >
        {{ sidebarExpanded ? '◀ 收起侧栏' : '▶' }}
      </div>

      <!-- PCanvasGrid autoBoxSize -->
      <div style="flex: 1; min-width: 0; overflow: hidden">
        <p-canvas-grid
          v-bind="responsiveGridSetting"
          @toolbar-button-click="handleToolbarBtn"
          @toolbar-tool-click="handleToolbarBtn"
        />
      </div>
    </div>
  </div>
</template>
