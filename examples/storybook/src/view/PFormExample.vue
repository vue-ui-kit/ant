<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { PFormProps } from '@vue-ui-kit/ant';
  import { Card as ACard, Button as AButton, Space as ASpace } from 'ant-design-vue';

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

  const handleFormSubmit = () => {
    console.log('表单数据:', formData.value);
  };

  const handleFormReset = () => {
    console.log('表单重置');
  };
</script>

<template>
  <div>
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
</template>
