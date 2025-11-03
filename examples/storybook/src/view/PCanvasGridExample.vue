<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { queryStudents } from '../Mock/apis/school';
  import { PCanvasGridProps, labelColDict, getButtonResponsive } from '@vue-ui-kit/ant';
  import {
    Card as ACard,
    Button as AButton,
    Space as ASpace,
    Tag as ATag,
    message,
  } from 'ant-design-vue';
  import { UserOutlined } from '@ant-design/icons-vue';

  interface IPage {
    page: number;
    size: number;
  }

  const selectedRecords = ref<any[]>([]);

  // 学生数据配置
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
          props: {
            disabled: true,
          },
        },
      },
      {
        field: 'grade',
        width: 100,
        title: '年级',
        slots: {
          default: ({ row }) => <a-tag color="blue">{row.grade}</a-tag>,
        },
      },
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
            props: {
              placeholder: '请输入姓名或地址',
            },
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
      pageSize: 50,
    },
    staticConfig: {
      multiple: true,
      selectable: true,
    },
    toolbarConfig: {
      buttons: [
        {
          type: 'primary',
          code: 'add',
          content: '新增',
        },
        {
          type: 'default',
          code: 'edit',
          content: '编辑',
        },
        {
          type: 'default',
          code: 'delete',
          content: '删除',
        },
        {
          type: 'default',
          code: 'export',
          content: '导出',
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
          } as IPage & { keyword?: string; grade?: string }),
      },
    },
    config: {
      SELECTABLE_METHOD: ({ row }) => {
        return row.age > 18;
      },
      ENABLE_AUTOFILL: true,
      AUTO_ROW_HEIGHT: true,
    },
  }));

  // 工具栏按钮事件处理
  const handleToolbarBtn = ({ code, records }: { code: string; records: any[] }) => {
    selectedRecords.value = records;

    switch (code) {
      case 'add':
        message.success('新增学生成功');
        break;
      case 'edit':
        if (records.length === 1) {
          message.success('编辑学生成功');
        } else {
          message.warning('请选择一个记录进行编辑');
        }
        break;
      case 'delete':
        if (records.length > 0) {
          message.success(`删除${records.length}条学生记录成功`);
        } else {
          message.warning('请选择要删除的记录');
        }
        break;
      case 'export':
        message.success('导出学生数据成功');
        break;
    }
  };
</script>

<template>
  <div>
    <a-typography-title :level="3">PCanvasGrid 示例</a-typography-title>
    <p>展示PCanvasGrid的代理模式和分页功能</p>

    <a-card title="学生列表" style="margin-top: 16px">
      <div style="height: 580px">
        <p-canvas-grid v-bind="studentsGridSetting" @toolbar-button-click="handleToolbarBtn" />
      </div>
    </a-card>

    <a-card title="操作记录" style="margin-top: 16px" v-if="selectedRecords.length > 0">
      <p>已选择 {{ selectedRecords.length }} 条记录：</p>
      <ul>
        <li v-for="(record, index) in selectedRecords.slice(0, 5)" :key="index">
          {{ record.name }}
        </li>
        <li v-if="selectedRecords.length > 5">... 还有 {{ selectedRecords.length - 5 }} 条记录</li>
      </ul>
    </a-card>
  </div>
</template>
