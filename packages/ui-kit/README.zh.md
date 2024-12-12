<div align="center">
[English](./README.md) | 简体中文
</div>
# Vue UI Kit 使用文档

基于 Ant Design Vue 的 Vue 3 UI 组件库，提供增强的表单、网格和实用组件。

## 安装

```bash
npm install @vue-ui-kit/ant
# 或
yarn add @vue-ui-kit/ant
# 或
pnpm add @vue-ui-kit/ant
```

```ts
/*main.ts*/
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import UIKit from '@vue-ui-kit/ant';
import '@vue-ui-kit/ant/scss';
/*创建渲染器(推荐使用tsx配置)*/
import { setupKit } from './setup/kit.tsx';

/*创建格式化*/
UIKit.addFormatter({
  test: ({ row, column, cellValue }) => 'test:...' + 'field:' + column.field + '...v:' + cellvalue,
});
createApp(App).use(Antd).use(UIKit).mount('#app');
```

```tsx
/*kit.tsx*/
import UIKit from '@vue-ui-kit/ant';
import { TypographyParagraph, Switch } from 'ant-design-vue';

export const setupKit = () => {
  /*注册$paragraph作为单元格渲染器*/
  UIKit.addRender('$paragraph', {
    renderDefault({ props = {} }: RenderOptions, { row, field }: RenderTableParams) {
      const content = props.getContent?.({ row, field }) ?? (valued(field) ? row[field!] : '');
      return valued(field) ? (
        <TypographyParagraph
          {...merge({}, defaultProps.$paragraph, omit(props, ['content', 'getContent']))}
          content={content}
        />
      ) : null;
    },
  });
  /*注册$switch 作为表单渲染器*/
  UIKit.addRender('$switch', {
    renderItemContent(
      { props = {}, events = {} }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      return valued(field) ? (
        <Switch
          v-model:checked={data[field!]}
          {...props}
          onChange={(...arg) => {
            events.change?.({ data, field }, ...arg);
          }}
        />
      ) : null;
    },
  });
};

/*
* 已内置了渲染器
* 
  $input: Input,
  AInput: Input,
  $textarea: Textarea,
  Textarea: Textarea,
  $number: InputNumber,
  AInputNumber: InputNumber,
  $select: Select,
  ASelect: Select,
  $date: DatePicker,
  ADatePicker: DatePicker,
  $range: RangePicker,
  ARangePicker: RangePicker,
  AAutoComplete: AutoComplete,
  $Cascader: Cascader,
  ACascader: Cascader,
  ACheckbox: Checkbox,
  AMentions: Mentions,
  ARate: Rate,
  ASlider: Slider,
  $time: TimePicker,
  ATimePicker: TimePicker,
  ATreeSelect: TreeSelect,

* 
* */
```

## 环境要求

- Node.js >= 16
- Vue >= 3.2.0
- ant-design-vue >= 4.0.0
- @ant-design/icons-vue >= 7.0.0

## 组件

### PForm

增强的表单组件，具有简化的配置和动态字段功能。

#### 属性

| 属性        | 类型               | 说明                            |
| ----------- | ------------------ | ------------------------------- |
| items       | `PFormItemProps[]` | 表单项配置数组                  |
| customReset | `() => void`       | 自定义重置函数                  |
| 其他        | `FormProps`        | 所有 ant-design-vue Form 的属性 |

#### PFormItemProps

| 属性          | 类型                            | 说明                       | 默认值 |
| ------------- | ------------------------------- | -------------------------- | ------ |
| field         | `string`                        | 表单字段名                 | -      |
| title         | `string`                        | 字段标签                   | -      |
| span          | `number`                        | 栅格跨度                   | -      |
| colon         | `boolean`                       | 是否显示冒号               | true   |
| forceRequired | `boolean`                       | 显示必填标记（不进行验证） | false  |
| align         | `'left' \| 'right' \| 'center'` | 文本对齐方式               | 'left' |
| col           | `ColProps`                      | 栅格列属性                 | -      |
| rule          | `Rule[]`                        | 验证规则                   | -      |
| tooltipConfig | `TooltipConfig`                 | 提示配置                   | -      |

#### 示例

```vue
<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { TextAdAccount } from '...somewhere';
  import { PFormProps } from '@vue-ui-kit/ant';

  const createFormData = ref<TextAdAccount>({
    account_code: '',
    key_id: '',
    org_id: '',
    secret_key: '',
  });
  const createFormSetting = computed<PFormProps<TestAdAccount>>(() => ({
    rules: {
      account_code: [{ required: true, message: '请选择Test账户', trigger: 'change' }],
      org_id: [{ required: true, message: '请选择授权组织', trigger: 'change' }],
      secret_key: [{ required: true, message: '请输入Secret Key', trigger: 'change' }],
      key_id: [{ required: true, message: '请输入Key ID', trigger: 'change' }],
    },
    items: [
      {
        title: '渠道',
        span: 24,
        itemRender: {
          name: 'readonly',
          props: {
            getText: () => 'Test',
          },
        },
      },
      {
        field: 'account_code',
        title: '账户',
        span: 24,
        itemRender: {
          name: '$select',
          props: {
            options: [
              { label: 'Test账户1', value: '1' },
              { label: 'Test账户2', value: '2' },
            ],
          },
          events: {
            change: ({ data }) => {
              data.org_id = '';
            },
          },
        },
        tooltipConfig: {
          title: '账号是指登录Test后台的邮箱',
        },
      },
      {
        field: 'org_id',
        title: '授权组织',
        span: 24,
        slots: {
          default: ({ data }) => <my-custom-input v-model={data.org_id}></my-custom-input>,
        },
        tooltipConfig: {
          title: '对应账号下的组织名称、组织ID、组织核心ID（Org Core ID）',
        },
      },
      {
        field: 'secret_key',
        title: 'Secret Key',
        span: 24,
        itemRender: {
          name: '$input',
        },
        tooltipConfig: {
          title: '我是tooltip',
        },
      },
      {
        field: 'key_id',
        title: 'Key ID',
        span: 24,
        itemRender: {
          name: '$input',
        },
        tooltipConfig: {
          title: '我是tooltip',
        },
      },
    ],
  }));
</script>
<template>
  <p-form ref="cf" :data="createFormData" v-bind="createFormSetting" />
</template>
```

### PGrid

高级表格组件，内置数据管理和工具栏功能。

#### 属性

| 属性          | 类型                 | 说明           | 默认值  |
| ------------- | -------------------- | -------------- | ------- |
| rowKey        | `string`             | 唯一标识字段   | 'id'    |
| columns       | `ColumnProps[]`      | 表格列配置     | -       |
| formConfig    | `PFormProps`         | 搜索表单配置   | -       |
| toolbarConfig | `ToolbarConfig`      | 工具栏按钮配置 | -       |
| pageConfig    | `PageConfig`         | 分页配置       | -       |
| proxyConfig   | `ProxyConfig`        | 数据获取配置   | -       |
| selectConfig  | `SelectConfig`       | 行选择配置     | -       |
| scrollMode    | `'outer' \| 'inner'` | 滚动模式       | 'outer' |
| fitHeight     | `number`             | 自适应高度调整 | -       |

#### 示例

```vue
<script setup lang="ts">
  import { ColumnProps, getButtonResponsive, labelColDict, PGridProps } from '@vue-ui-kit/ant';
  import { computed } from 'vue';
  import { hasAuth } from '...somewhere';
  import { getChannelPage, deleteChannel, deleteChannels } from '...somewhere';
  import type { Channel, ChannelParam } from '...somewhere';

  const gridSetting = computed<PGridProps<Channel, ChannelParam>>(() => ({
    selectConfig: {
      multiple: true,
    },
    toolbarConfig: {
      buttons: [
        {
          code: 'multiDelete',
          content: t('批量删除'),
          type: 'danger',
        },
      ],
    },
    columns: [
      {
        field: 'id',
        title: 'ID',
        width: 110,
      },
      {
        field: 'name',
        title: '渠道名称',
        width: 140,
      },
      {
        field: 'short_name',
        title: '简称',
        width: 140,
      },
      {
        field: 'operator',
        title: '操作人',
        width: 120,
      },
      {
        field: 'update_time',
        title: '最近修改时间',
        width: 180,
      },
      ...(hasAuth('common_channel_admin')
        ? ([
            {
              title: '操作',
              fixed: 'right',
              width: 160,
              cellRender: {
                name: 'ButtonTree',
                children: [
                  {
                    content: '编辑',
                    type: 'link',
                    clickEvt: ({ row }: { row: Channel }) => doEdit(row),
                  },
                  {
                    content: '删除',
                    type: 'link',
                    danger: true,
                    clickEvt: ({ row }: { row: Channel }) => confirmDelete(row),
                  },
                ],
              },
            },
          ] as ColumnProps<Channel>[])
        : []),
    ],
    formConfig: {
      items: [
        {
          field: 'name',
          title: '渠道名称',
          labelCol: labelColDict[4],
          itemRender: {
            name: '$input',
            props: {
              placeholder: '请输入广告渠道名称',
            },
          },
        },
        {
          col: getButtonResponsive(1),
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
    proxyConfig: {
      response: {
        total: 'total',
        result: 'list',
      },
      ajax: {
        query: ({ form, page }) =>
          getChannelPage({
            ...form,
            ...page,
          } as ChannelParam),
        multiDelete: deleteChannels,
      },
    },
  }));
</script>
<template>
  <p-grid ref="gridEl" v-bind="gridSetting" />
</template>
```

### PFormGroup

表单分组组件，用于将表单字段组织成可折叠的部分。

#### 属性

| 属性           | 类型                   | 说明               |
| -------------- | ---------------------- | ------------------ |
| getFormSetting | `(data) => PFormProps` | 获取表单设置的函数 |
| source         | `object`               | 表单数据源         |

#### 示例

```vue
/*get-form-setting 本质就是生成内部form的computed属性的方法*/
<template>
  <p-form-group
    :source="formData"
    :get-form-setting="
      (data) => ({
        items: [
          {
            field: 'group1',
            title: '分组1',
            itemsRender: {
              name: '$input',
            },
          },
        ],
      })
    "
  />
</template>
```

### PromisePicker

支持异步数据的选择器组件。

#### 属性

| 属性        | 类型               | 说明       |
| ----------- | ------------------ | ---------- |
| gridSetting | `PGridProps`       | 表格配置   |
| title       | `string`           | 模态框标题 |
| width       | `string \| number` | 模态框宽度 |

#### 示例

```vue
<script setup lang="ts">
  import { ref } from 'vue';
  import { PromisePickerInstance } from '@vue-ui-kit/ant';
  import { Asset } from '...somewhere';
  import { fetchUsers } from '...somewhere';

  const pickerEl = ref<PromisePickerInstance<Asset>>();
  const test = () => {
    pickerEl.value!.pick().then(({ row }) => {
      console.log(row);
    });
  };
</script>
<template>
  <promise-picker
    ref="pickerEl"
    title="选择用户"
    :grid-setting="{
      columns: [
        { title: '姓名', field: 'name' },
        { title: '邮箱', field: 'email' },
      ],
      proxyConfig: {
        ajax: {
          query: fetchUsers,
        },
      },
    }"
  />
</template>
```

## Q&A

### 1. 使用computed +v-bind生成动态表格+表单时，表单内选项值更新，导致表格重新渲染，怎么办？

答： 将formConfig 剥离出来写另外一个computed <p-grid v-bind="gridSetting" :form-config="computedFormConfig" />

### 2. 目前表格ajax只支持了multiDelete和表格数据获取？

答： 编辑详情大部分情况下都和表格无法一一对应，所以没有开发意义。多行删除需要和selectConfig: { multiple: true, }, toolbarConfig》buttons>code:"multipleDelete" 一起使用

### 3. 为什么推荐computed写法？

答： 简化所有动态逻辑 仅此而已，遇到复杂问题可以自己尝试reactive 然后去维护他 但大部分情况computed好用些
