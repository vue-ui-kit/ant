<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Student } from './Mock/apis/type';
  import { queryStudents } from './Mock/apis/school';
  import type { Column as EVirtColumn } from 'e-virt-table';
  import { PGridProps, PFormProps, PFormGroupProps, labelColDict } from '@vue-ui-kit/ant';
  import {
    Card as ACard,
    Button as AButton,
    Divider as ADivider,
    Space as ASpace,
    Typography,
    Switch as ASwitch,
  } from 'ant-design-vue';
  import { sample } from 'xe-utils';

  const { Title } = Typography;

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

  // 表单数据
  const formData = ref({
    name: '',
    email: '',
    age: undefined as number | undefined,
    gender: '',
    birthday: '',
    description: '',
    skills: [] as string[],
    isActive: false,
  });

  // 动态表单组数据
  const groupFormData = ref([
    {
      __index: 0,
      projectName: '项目A',
      startDate: '',
      endDate: '',
      budget: undefined as number | undefined,
      members: [] as string[],
    },
  ]);

  // 当前展示模式
  const currentView = ref<'grid' | 'form' | 'group' | 'canvasTable'>('grid');

  // PCanvasGrid 配置
  const canvasGridSetting = computed<PGridProps<Student, { keyword?: string } & IPage>>(() => ({
    columns: [
      {
        field: 'name',
        width: 200,
        title: '姓名',
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
    tableConfig: {
      rowSelection: {
        type: 'checkbox',
      },
    },
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
          content: '编辑',
          icon: 'EditOutlined',
        },
        {
          type: 'danger',
          code: 'delete',
          content: '删除',
          icon: 'DeleteOutlined',
        },
      ],
      tools: [
        {
          type: 'default',
          code: 'export',
          content: '导出',
          icon: 'ExportOutlined',
        },
        {
          type: 'default',
          code: 'refresh',
          content: '刷新',
          icon: 'ReloadOutlined',
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
  const bigData = ref<Student[]>(
    Array.from({ length: 10000 }, (_, i) => ({
      name: `学生${i}`,
      enName: `Student${i}`,
      id: i,
      score: Math.floor(Math.random() * 100),
      age: Math.floor(Math.random() * 5) + 10,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      class: `class${i}`,
      address: `address${i}`,
      phone: `phone${i}`,
      email: `email${i}`,
      birthDate: `birthDate${i}`,
      createTime: `createTime${i}`,
      hobby: sample(['reading', 'swimming', 'coding'], Math.floor(Math.random() * 3)),
      isStudent: Math.random() > 0.5,
      isTeacher: Math.random() > 0.5,
      isAdmin: Math.random() > 0.5,
      isSuperAdmin: Math.random() > 0.5,
    })),
  );
  const canvasTableColumns: EVirtColumn[] = [
    {
      key: '#',
      title: '',
      width: 80,
      type: 'selection',
      fixed: 'left',
    },
    {
      key: 'id',
      title: 'ID',
      width: 180,
    },
    {
      key: 'name',
      title: '姓名',
      minWidth: 300,
      render: 'capitalize',
    },
    {
      key: 'enName',
      title: '英文名',
      width: 300,
      render: 'capitalize',
    },
    {
      key: 'age',
      title: '年龄',
      width: 200,
    },
    {
      key: 'gender',
      title: '性别',
      width: 200,
    },
    {
      key: 'class',
      title: '班级',
      width: 200,
    },
    {
      key: 'address',
      title: '地址',
      width: 200,
    },
    {
      key: 'phone',
      title: '电话',
      width: 200,
    },
    {
      key: 'email',
      title: '邮箱',
      width: 200,
    },
    {
      key: 'birthDate',
      title: '生日',
      width: 200,
    },
    {
      key: 'createTime',
      title: '创建时间',
      width: 200,
    },
    {
      key: 'hobby',
      title: '爱好',
      width: 200,
    },

    {
      key: 'score',
      title: '分数',
      width: 200,
      render: 'colorFullScore',
      fixed: 'right',
    },
  ];
  const gridSetting = computed<PGridProps<Student, { keyword?: string } & IPage>>(() => ({
    columns: [
      {
        field: 'name',
        width: 200,
        title: '姓名',
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
    },
    toolbarConfig: {
      buttons: [
        {
          type: 'primary',
          code: 'test',
          content: '测试',
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

  // PForm 配置
  const formSetting = computed<PFormProps<typeof formData.value>>(() => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    items: [
      {
        field: 'name',
        title: '姓名',
        span: 12,
        rule: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        itemRender: {
          name: '$input',
          props: {
            placeholder: '请输入姓名',
          },
        },
      },
      {
        field: 'email',
        title: '邮箱',
        span: 12,
        rule: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
        ],
        itemRender: {
          name: '$input',
          props: {
            placeholder: '请输入邮箱',
          },
        },
      },
      {
        field: 'age',
        title: '年龄',
        span: 12,
        rule: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
        itemRender: {
          name: '$number',
          props: {
            placeholder: '请输入年龄',
            min: 1,
            max: 120,
          },
        },
      },
      {
        field: 'gender',
        title: '性别',
        span: 12,
        rule: [{ required: true, message: '请选择性别', trigger: 'change' }],
        itemRender: {
          name: '$select',
          props: {
            placeholder: '请选择性别',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
            ],
          },
        },
      },
      {
        field: 'birthday',
        title: '生日',
        span: 12,
        itemRender: {
          name: '$date',
          props: {
            placeholder: '请选择生日',
            format: 'YYYY-MM-DD',
          },
          attrs: {
            style: {
              width: '100%',
            },
          },
        },
      },
      {
        field: 'skills',
        title: '技能',
        span: 12,
        itemRender: {
          name: '$select',
          props: {
            mode: 'multiple',
            placeholder: '请选择技能',
            options: [
              { label: 'Vue.js', value: 'vue' },
              { label: 'React', value: 'react' },
              { label: 'Angular', value: 'angular' },
              { label: 'Node.js', value: 'nodejs' },
              { label: 'Python', value: 'python' },
            ],
          },
        },
      },
      {
        field: 'description',
        title: '描述',
        span: 24,
        itemRender: {
          name: '$textarea',
          props: {
            placeholder: '请输入描述',
            rows: 4,
          },
        },
      },
      {
        field: 'isActive',
        title: '状态',
        span: 24,
        itemRender: {
          name: 'ASwitch',
          props: {
            checkedChildren: '启用',
            unCheckedChildren: '禁用',
          },
        },
      },
    ],
  }));

  // PFormGroup 配置
  const groupFormSetting = computed<PFormGroupProps<(typeof groupFormData.value)[0]>>(() => ({
    title: '项目管理',
    showAdd: true,
    tabLabel: '项目',
    max: 5,
    getFormSetting: (data) => ({
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
      items: [
        {
          field: 'projectName',
          title: '项目名称',
          span: 24,
          rule: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入项目名称',
            },
          },
        },
        {
          field: 'startDate',
          title: '开始日期',
          span: 12,
          rule: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
          itemRender: {
            name: '$date',
            props: {
              placeholder: '请选择开始日期',
              format: 'YYYY-MM-DD',
            },
          },
        },
        {
          field: 'endDate',
          title: '结束日期',
          span: 12,
          rule: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
          itemRender: {
            name: '$date',
            props: {
              placeholder: '请选择结束日期',
              format: 'YYYY-MM-DD',
            },
          },
        },
        {
          field: 'budget',
          title: '预算',
          span: 12,
          itemRender: {
            name: '$number',
            props: {
              placeholder: '请输入预算',
              min: 0,
              formatter: (value: string) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
              parser: (value: string) => value.replace(/￥\s?|(,*)/g, ''),
            },
          },
        },
        {
          field: 'members',
          title: '项目成员',
          span: 12,
          itemRender: {
            name: '$select',
            props: {
              mode: 'multiple',
              placeholder: '请选择项目成员',
              options: [
                { label: '张三', value: 'zhangsan' },
                { label: '李四', value: 'lisi' },
                { label: '王五', value: 'wangwu' },
                { label: '赵六', value: 'zhaoliu' },
              ],
            },
          },
        },
      ],
    }),
  }));

  const handleToolbarBtn = ({ code, records }: { code: string; records: Student[] }) => {
    switch (code) {
      case 'test':
        console.log('test', records);
        break;
    }
  };

  const handleFormSubmit = () => {
    console.log('表单数据:', formData.value);
  };

  const handleFormReset = () => {
    console.log('表单重置');
  };

  const handleGroupFormSubmit = () => {
    console.log('表单组数据:', groupFormData.value);
  };

  const handleCanvasToolbarBtn = ({ code, records }: { code: string; records: Student[] }) => {
    switch (code) {
      case 'add':
        console.log('新增操作');
        break;
      case 'edit':
        if (records.length === 0) {
          console.warn('请选择要编辑的记录');
          return;
        }
        console.log('编辑操作:', records);
        break;
      case 'delete':
        if (records.length === 0) {
          console.warn('请选择要删除的记录');
          return;
        }
        console.log('删除操作:', records);
        break;
    }
  };

  const handleCanvasToolClick = ({ code }: { code: string }) => {
    switch (code) {
      case 'export':
        console.log('导出操作');
        break;
      case 'refresh':
        console.log('刷新操作');
        break;
    }
  };
</script>

<template>
  <div style="height: 100vh; width: 100%; padding: 20px; overflow-y: auto">
    <div style="margin-bottom: 20px">
      <a-typography-title :level="2">Vue UI Kit 示例</a-typography-title>
      <a-space>
        <a-button
          :type="currentView === 'grid' ? 'primary' : 'default'"
          @click="currentView = 'grid'"
        >
          PGrid 示例
        </a-button>
        <a-button
          :type="currentView === 'form' ? 'primary' : 'default'"
          @click="currentView = 'form'"
        >
          PForm 示例
        </a-button>
        <a-button
          :type="currentView === 'group' ? 'primary' : 'default'"
          @click="currentView = 'group'"
        >
          PFormGroup 示例
        </a-button>
        <a-button
          :type="currentView === 'canvasTable' ? 'primary' : 'default'"
          @click="currentView = 'canvasTable'"
        >
          PCanvasTable 示例
        </a-button>
      </a-space>
    </div>

    <a-divider />

    <!-- PGrid 示例 -->
    <div v-if="currentView === 'grid'">
      <a-typography-title :level="3">PGrid - 增强数据表格</a-typography-title>
      <p>集成了查询表单、分页、工具栏等功能的数据表格组件</p>
      <div style="height: 600px">
        <p-grid v-bind="gridSetting" @toolbar-button-click="handleToolbarBtn" />
      </div>
    </div>

    <!-- PForm 示例 -->
    <div v-if="currentView === 'form'">
      <a-typography-title :level="3">PForm - 增强表单</a-typography-title>
      <p>基于配置的动态表单组件，支持多种字段类型和验证规则</p>
      <a-card title="用户信息表单" style="margin-top: 16px">
        <p-form
          v-bind="formSetting"
          :data="formData"
          @apply="handleFormSubmit"
          @reset="handleFormReset"
        />
        <template #actions>
          <a-space style="margin-top: 16px">
            <a-button type="primary" @click="handleFormSubmit">提交</a-button>
            <a-button @click="handleFormReset">重置</a-button>
          </a-space>
        </template>
      </a-card>
    </div>

    <!-- PFormGroup 示例 -->
    <div v-if="currentView === 'group'">
      <a-typography-title :level="3">PFormGroup - 动态表单组</a-typography-title>
      <p>支持动态添加、删除和管理多个表单实例的组件</p>
      <div style="margin-top: 16px">
        <p-form-group v-model="groupFormData" v-bind="groupFormSetting" />
        <a-space style="margin-top: 16px">
          <a-button type="primary" @click="handleGroupFormSubmit">保存所有项目</a-button>
        </a-space>
      </div>
    </div>

    <div v-if="currentView === 'canvasTable'">
      <a-typography-title :level="3">PCanvasGrid - Canvas虚拟表格</a-typography-title>
      <p>基于e-virt-table的高性能虚拟滚动表格组件，支持大数据量渲染</p>
      <div style="height: 600px; margin-top: 16px">
        <p-canvas-table
          :data="bigData"
          :columns="canvasTableColumns"
          :config="{
            HEIGHT: 500,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .demo-container {
    margin: 20px 0;
  }
</style>
