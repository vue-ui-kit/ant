<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { Student } from '../Mock/apis/type';
  import { queryStudents } from '../Mock/apis/school';
  import { PromisePickerProps, PromisePickerInstance, labelColDict } from '@vue-ui-kit/ant';
  import { Card as ACard, Button as AButton, Space as ASpace, message } from 'ant-design-vue';
  import { PromisePicker } from '@vue-ui-kit/ant';

  const promisePickerRef = ref<PromisePickerInstance<Student>>();

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

  // PromisePicker 配置
  const promisePickerSetting = computed<PromisePickerProps<Student, { keyword?: string } & IPage>>(
    () => ({
      title: '选择学生',
      width: '80%',
      multipleAllowEmpty: false,
      beforePick: async (rowOrRows) => {
        // 模拟异步验证
        await new Promise((resolve) => setTimeout(resolve, 100));
        return Promise.resolve();
      },
      gridSetting: {
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
          {
            field: 'age',
            width: 150,
            title: '年龄',
          },
          {
            field: 'gender',
            width: 150,
            title: '性别',
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
                  placeholder: '请输入关键字搜索',
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
      },
    }),
  );

  // PromisePicker 测试函数
  const testSinglePicker = async () => {
    try {
      const result = await promisePickerRef.value?.pick();
      if (result && 'row' in result) {
        message.success(`单选结果: ${result.row.name} (ID: ${result.row.id})`);
        console.log('单选结果:', result);
      }
    } catch (error) {
      message.info('用户取消了选择');
    }
  };

  const testMultiplePicker = async () => {
    try {
      const result = await promisePickerRef.value?.pickMultiple();
      if (Array.isArray(result)) {
        message.success(`多选结果: 选择了 ${result.length} 个学生`);
        console.log('多选结果:', result);
      }
    } catch (error) {
      message.info('用户取消了选择');
    }
  };
</script>

<template>
  <div>
    <a-typography-title :level="3">PromisePicker - 数据选择器</a-typography-title>
    <p>基于Promise的数据选择器组件，支持单选和多选模式</p>
    <a-card title="PromisePicker 测试" style="margin-top: 16px">
      <a-space direction="vertical" style="width: 100%">
        <a-space>
          <a-button type="primary" @click="testSinglePicker"> 测试单选模式 </a-button>
          <a-button type="primary" @click="testMultiplePicker"> 测试多选模式 </a-button>
        </a-space>
        <p>点击按钮打开数据选择器，选择学生数据</p>
      </a-space>
    </a-card>

    <!-- PromisePicker 组件 -->
    <promise-picker ref="promisePickerRef" v-bind="promisePickerSetting" />
  </div>
</template>
