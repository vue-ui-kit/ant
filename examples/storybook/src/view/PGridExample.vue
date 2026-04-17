<script setup lang="tsx">
  import { HeartOutlined, StarOutlined } from '@ant-design/icons-vue';
  import { PGridProps, labelColDict } from '@vue-ui-kit/ant';
  import { computed, h } from 'vue';
  import { queryStudents } from '../Mock/apis/school';
  import { Student } from '../Mock/apis/type';

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

  const gridSetting = computed<PGridProps<Student, { keyword?: string } & IPage>>(() => ({
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
          labelCol: labelColDict[3],
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入关键字',
            },
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
  <div>
    <a-typography-title :level="3">PGrid - 增强数据表格</a-typography-title>
    <p>集成了查询表单、分页、工具栏等功能的数据表格组件</p>
    <a-alert
      message="content 属性支持多种类型"
      description="1. 字符串：直接显示文本 | 2. 函数返回字符串：动态文本 | 3. 函数返回组件：使用 h() 渲染自定义组件"
      type="info"
      show-icon
      style="margin-bottom: 16px"
    />
    <div style="height: 600px">
      <p-grid
        v-bind="gridSetting"
        @toolbar-button-click="handleToolbarBtn"
        @toolbar-tool-click="handleToolbarBtn"
      />
    </div>
  </div>
</template>
