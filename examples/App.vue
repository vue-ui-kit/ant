<template>
  <div style="height: 100vh; width: 100%">
    <p-grid v-bind="gridSetting" />
  </div>
</template>
<script lang="ts" setup name="App">
  import { computed } from 'vue';
  import { PGridProps } from '#/antProxy';
  import PGrid from '@/components/PGrid.vue';
  import { Student } from './Mock/apis/type';
  import { queryStudents } from './Mock/apis/school';

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
</script>
<style lang="scss" scoped></style>
