<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { PFormGroupProps } from '@vue-ui-kit/ant';
  import { Button as AButton, Space as ASpace } from 'ant-design-vue';

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

  // PFormGroup 配置
  const groupFormSetting = computed<PFormGroupProps<(typeof groupFormData.value)[0]>>(() => ({
    title: '项目管理',
    showAdd: true,
    tabLabel: '项目',
    max: 115,
    editAble: true,
    itemMenus: [{ content: '测试', code: 'test' }],
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

  const handleGroupFormSubmit = () => {
    console.log('表单组数据:', groupFormData.value);
  };
</script>

<template>
  <div>
    <a-typography-title :level="3">PFormGroup - 动态表单组</a-typography-title>
    <p>支持动态添加、删除和管理多个表单实例的组件</p>
    <div style="margin-top: 16px">
      <p-form-group v-model="groupFormData" v-bind="groupFormSetting" />
      <a-space style="margin-top: 16px">
        <a-button type="primary" @click="handleGroupFormSubmit">保存所有项目</a-button>
      </a-space>
    </div>
  </div>
</template>
