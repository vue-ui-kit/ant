<script setup lang="tsx">
  import { HeartOutlined, StarOutlined } from '@ant-design/icons-vue';
  import { PGridProps } from '@vue-ui-kit/ant';
  import { computed, h, ref } from 'vue';
  import { queryStudents } from '../Mock/apis/school';
  import { Student } from '../Mock/apis/type';
  import { usePFormResponsive } from '../utils/responsive';
  interface IPage {
    /**
     * 第几页
     */
    page: number;
    /**
     * 一页显示的数量
     */
    size: number;
  }
  const collapse = ref(false);
  const headerExpanded = ref(false);
  const gridContainer = ref<HTMLElement | null>(null);
  const { itemSpan, getLabelCol, getTailSpan } = usePFormResponsive(gridContainer);
  const gridSetting = computed<PGridProps<Student, { keyword?: string } & IPage>>(() => ({
    /** 本页外层未写死高度，由根节点按视口撑满（与 v-rest 同源逻辑，见 ui-kit autoViewportBox） */
    autoBoxSize: true,
    striped: true,
    columns: [
      {
        field: 'name',
        width: 200,
        title: '姓名',
        fixed: 'left',
      },
      {
        field: 'enName',
        width: 200,
        title: '英文名',
        formatter: 'capitalize',
      },
      {
        field: 'id',
        width: 200,
        title: 'ID',
      },
      {
        field: 'score',
        width: 200,
        title: '分数',
      },
      {
        field: 'id',
        width: 200,
        title: 'ID',
      },
      {
        field: 'score',
        width: 200,
        title: '分数',
      },
      {
        field: 'id',
        width: 200,
        title: 'ID',
      },
      {
        field: 'score',
        width: 200,
        title: '分数',
      },
      {
        field: 'id',
        width: 200,
        title: 'ID',
      },
      {
        field: 'score',
        width: 200,
        title: '分数',
      },
      {
        field: 'id',
        width: 200,
        title: 'ID',
      },
      {
        field: 'score',
        width: 200,
        title: '分数',
      },
      {
        title: '操作',
        width: 100,
        fixed: 'right',
        cellRender: {
          name: 'ButtonTree',
          children: [
            {
              getContent: ({ row }: { row: Student }) =>
                row.score && row.score > 60 ? '（已通过）' : '请家长',
              getProps: ({ row }: { row: Student }) => ({
                disabled: row.score && row.score > 60,
                type: row.score && row.score > 60 ? 'success' : 'link',
              }),
            },
          ],
        },
      },
    ],
    formConfig: {
      items: [
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          field: 'keyword',
          title: '关键字',
          span: itemSpan.value,
          labelCol: getLabelCol(3),
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
          },
        },
        {
          span: getTailSpan(7),
          align: 'right',
          itemRender: {
            name: '$buttons',
            children: [
              {
                props: {
                  content: '查询',
                  htmlType: 'submit',
                  type: 'primary',
                },
              },
              {
                props: {
                  content: '重置',
                  htmlType: 'reset',
                },
              },
            ],
          },
        },
      ],
    },
    pageConfig: {
      pageSize: 10,
    },
    selectConfig: {
      multiple: true,
      showCount: true,
    },
    toolbarConfig: {
      buttons: [
        {
          type: 'primary',
          code: 'test',
          content: '测试（字符串）',
        },
        {
          type: 'default',
          code: 'dynamic',
          // 函数返回字符串
          content: () => `动态文本 ${new Date().getSeconds()}s`,
        },
        {
          type: 'default',
          code: 'component',
          // 函数返回组件
          content: () =>
            h('span', { style: { color: '#1890ff' } }, [
              h(StarOutlined, { style: { marginRight: '4px' } }),
              '自定义组件',
            ]),
        },
        {
          type: 'default',
          code: 'dropdown',
          dropdowns: [
            {
              code: 'action1',
              content: '下拉选项1',
            },
            {
              code: 'action2',
              // 下拉菜单也支持函数返回组件
              content: () =>
                h('span', { style: { color: '#52c41a' } }, [
                  h(HeartOutlined, { style: { marginRight: '4px' } }),
                  '带图标选项',
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
          // tools 也支持函数返回内容
          content: () => h('span', { style: { fontWeight: 'bold' } }, '动态工具'),
        },
      ],
    },
    proxyConfig: {
      response: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: ({ form, page }) =>
          queryStudents({
            ...form,
            ...page,
          } as IPage & { keyword?: string }),
      },
    },
  }));

  const handleToolbarBtn = ({ code, records }: { code: string; records: Student[] }) => {
    switch (code) {
      case 'test':
        console.log('测试按钮', records);
        break;
      case 'dynamic':
        console.log('动态文本按钮', records);
        break;
      case 'component':
        console.log('自定义组件按钮', records);
        break;
      case 'action1':
        console.log('下拉选项1', records);
        break;
      case 'action2':
        console.log('带图标选项', records);
        break;
      case 'refresh':
        console.log('刷新工具', records);
        break;
      case 'dynamicTool':
        console.log('动态工具', records);
        break;
    }
  };
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <!-- 高度变化占位区域 -->
    <div
      :style="{
        height: headerExpanded ? '120px' : '40px',
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
        顶部占位容器（{{ headerExpanded ? '展开 120px' : '收起 40px' }}）
      </span>
      <a-button size="small" @click="headerExpanded = !headerExpanded">
        {{ headerExpanded ? '收起' : '展开' }}高度
      </a-button>
    </div>

    <div style="width: 100%; display: flex; flex: 1; min-height: 0">
      <div
        :style="{
          width: collapse ? '360px' : '80px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }"
      >
        <span style="border: 1px solid red" @click="collapse = !collapse">宽度变化</span>
      </div>
      <div style="width: 0; flex: 1; height: 100%" ref="gridContainer">
        <p-grid
          v-bind="gridSetting"
          @toolbar-button-click="handleToolbarBtn"
          @toolbar-tool-click="handleToolbarBtn"
        />
      </div>
    </div>
  </div>
</template>
