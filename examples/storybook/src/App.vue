<script setup lang="ts">
  import { computed } from 'vue';
  import { Student } from './Mock/apis/type';
  import { queryStudents } from './Mock/apis/school';
  import { PGridProps, labelColDict } from '@vue-ui-kit/ant';

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
    columns: [
      {
        field: 'name',
        width: 200,
        title: '姓名',
      },
      {
        field: 'enName',
        width: 200,
        title: '姓名',
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
  const handleToolbarBtn = ({ code, records }) => {
    switch (code) {
      case 'test':
        console.log('test', records);
        break;
    }
  };
</script>

<template>
  <div style="height: 100vh; width: 100%">
    <p-grid v-bind="gridSetting" @toolbar-button-click="handleToolbarBtn" />
  </div>
</template>
