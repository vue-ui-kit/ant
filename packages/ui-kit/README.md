<div align="center">
English | [简体中文](./README.zh.md)
</div>

# Vue UI Kit Documentation

A Vue 3 UI component library based on Ant Design Vue, providing enhanced form, grid, and utility components.

## Installation

```bash
npm install @vue-ui-kit/ant
# or
yarn add @vue-ui-kit/ant
# or
pnpm add @vue-ui-kit/ant
```

```ts
/*main.ts*/
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import UIKit from '@vue-ui-kit/ant';
import '@vue-ui-kit/ant/scss';
/*Create renderer (recommended to use tsx)*/
import { setupKit } from './setup/kit.tsx';

/*Create formatter*/
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
  /*Register $paragraph as cell renderer*/
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
  /*Register $switch as form renderer*/
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
* Built-in renderers:
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

## Requirements

- Node.js >= 16
- Vue >= 3.2.0
- ant-design-vue >= 4.0.0
- @ant-design/icons-vue >= 7.0.0

## Components

### PForm

Enhanced Form component with simplified configuration and dynamic fields.

#### Props

| Prop        | Type               | Description                    |
| ----------- | ------------------ | ------------------------------ |
| items       | `PFormItemProps[]` | Form items configuration array |
| customReset | `() => void`       | Custom reset function          |
| others      | `FormProps`        | All ant-design-vue Form props  |

#### PFormItemProps

| Prop | Type | Description | Default |
| --- | --- | --- | --- |
| field | `string` | Form field name | - |
| title | `string` | Field label | - |
| span | `number` | Grid span | - |
| colon | `boolean` | Show colon | true |
| forceRequired | `boolean` | Show required mark (without validation) | false |
| align | `'left' \| 'right' \| 'center'` | Text alignment | 'left' |
| col | `ColProps` | Grid column properties | - |
| rule | `Rule[]` | Validation rules | - |
| tooltipConfig | `TooltipConfig` | Tooltip configuration | - |

#### Example

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
      account_code: [{ required: true, message: 'Please select Test account', trigger: 'change' }],
      org_id: [
        { required: true, message: 'Please select authorization organization', trigger: 'change' },
      ],
      secret_key: [{ required: true, message: 'Please enter Secret Key', trigger: 'change' }],
      key_id: [{ required: true, message: 'Please enter Key ID', trigger: 'change' }],
    },
    items: [
      {
        title: 'Channel',
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
        title: 'Account',
        span: 24,
        itemRender: {
          name: '$select',
          props: {
            options: [
              { label: 'Test Account 1', value: '1' },
              { label: 'Test Account 2', value: '2' },
            ],
          },
          events: {
            change: ({ data }) => {
              data.org_id = '';
            },
          },
        },
        tooltipConfig: {
          title: 'Account refers to the email used to log in to the Test backend',
        },
      },
      {
        field: 'org_id',
        title: 'Authorization Org',
        span: 24,
        slots: {
          default: ({ data }) => <my-custom-input v-model={data.org_id}></my-custom-input>,
        },
        tooltipConfig: {
          title: 'Organization name, ID, and Core ID under the corresponding account',
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
          title: 'I am a tooltip',
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
          title: 'I am a tooltip',
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

Advanced grid component with built-in data management and toolbar functionality.

#### Props

| Prop          | Type                 | Description                   | Default |
| ------------- | -------------------- | ----------------------------- | ------- |
| rowKey        | `string`             | Unique identifier field       | 'id'    |
| columns       | `ColumnProps[]`      | Table columns configuration   | -       |
| formConfig    | `PFormProps`         | Search form configuration     | -       |
| toolbarConfig | `ToolbarConfig`      | Toolbar buttons configuration | -       |
| pageConfig    | `PageConfig`         | Pagination configuration      | -       |
| proxyConfig   | `ProxyConfig`        | Data fetching configuration   | -       |
| selectConfig  | `SelectConfig`       | Row selection configuration   | -       |
| scrollMode    | `'outer' \| 'inner'` | Scroll mode                   | 'outer' |
| fitHeight     | `number`             | Auto-fit height adjustment    | -       |

#### Example

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
        title: 'Channel Name',
        width: 140,
      },
      {
        field: 'short_name',
        title: 'Short Name',
        width: 140,
      },
      {
        field: 'operator',
        title: 'Operator',
        width: 120,
      },
      {
        field: 'update_time',
        title: 'Last Modified',
        width: 180,
      },
      ...(hasAuth('common_channel_admin')
        ? ([
            {
              title: 'Actions',
              fixed: 'right',
              width: 160,
              cellRender: {
                name: 'ButtonTree',
                children: [
                  {
                    content: 'Edit',
                    type: 'link',
                    clickEvt: ({ row }: { row: Channel }) => doEdit(row),
                  },
                  {
                    content: 'Delete',
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
          title: 'Channel Name',
          labelCol: labelColDict[4],
          itemRender: {
            name: '$input',
            props: {
              placeholder: 'Please enter channel name',
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
                  content: 'Search',
                  htmlType: 'submit',
                  type: 'primary',
                },
              },
              {
                props: {
                  content: 'Reset',
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

Form group component for organizing form fields into collapsible sections.

#### Props

| Prop           | Type                   | Description                   |
| -------------- | ---------------------- | ----------------------------- |
| getFormSetting | `(data) => PFormProps` | Function to get form settings |
| source         | `object`               | Form data source              |

## Q&A

### 1. When using computed + v-bind to generate dynamic tables + forms, form option updates cause table re-rendering. How to solve this?

Answer: Separate the formConfig into another computed property

```vue
<p-grid v-bind="gridSetting" :form-config="computedFormConfig" />
```

### 2. Does the table ajax currently only support multiDelete and table data fetching?

Answer: Edit details in most cases cannot correspond one-to-one with the table, so there's no development significance. Multi-row deletion needs to be used together with:

```ts
selectConfig: {
  multiple: true,
},
toolbarConfig: {
  buttons: {
    code: "multipleDelete"
  }
}
```

### 3. Why is the computed approach recommended?

Answer: It simplifies all dynamic logic, that's all. For complex scenarios, you can try using reactive and maintain it yourself, but in most cases, computed is more convenient.
