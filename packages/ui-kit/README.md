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

### PGrid

Enhanced data table component with integrated search form, pagination, and toolbar.

#### Basic Example

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { PGridProps, labelColDict } from '@vue-ui-kit/ant';

const gridSetting = computed<PGridProps<Student, { keyword?: string }>>(() => ({
  columns: [
    { field: 'name', title: 'Name', width: 200 },
    { field: 'email', title: 'Email', width: 200 },
    { field: 'age', title: 'Age', width: 100 },
  ],
  formConfig: {
    items: [
      {
        field: 'keyword',
        title: 'Keyword',
        labelCol: labelColDict[3],
        itemRender: {
          name: '$input',
          props: { placeholder: 'Search...' },
        },
      },
    ],
  },
  proxyConfig: {
    ajax: {
      query: ({ form, page }) => api.getStudents({ ...form, ...page }),
    },
  },
}));
</script>

<template>
  <p-grid v-bind="gridSetting" />
</template>
```

### PForm

Enhanced Form component with simplified configuration and dynamic fields.

#### Props

| Prop | Type | Description | Default |
| --- | --- | --- | --- |
| items | `PFormItemProps[]` | Form items configuration array | - |
| data | `T` | Form data object | - |
| customReset | `() => void` | Custom reset function | - |
| labelCol | `ColProps` | Label column layout | `{ span: 6 }` |
| wrapperCol | `ColProps` | Wrapper column layout | `{ span: 16 }` |
| ...others | `FormProps` | All ant-design-vue Form props | - |

#### Events

| Event | Description | Parameters |
| --- | --- | --- |
| apply | Triggered when form is submitted | `(formData: T) => void` |
| reset | Triggered when form is reset | `() => void` |

#### PFormItemProps

| Prop | Type | Description | Default |
| --- | --- | --- | --- |
| field | `string` | Form field name | - |
| title | `string` | Field label | - |
| span | `number` | Grid span (1-24) | - |
| colon | `boolean` | Show colon after label | `true` |
| labelCol | `ColProps` | Label column layout | - |
| wrapperCol | `ColProps` | Wrapper column layout | - |
| forceRequired | `boolean` | Show required mark (visual only) | `false` |
| align | `'left' \| 'right' \| 'center'` | Text alignment | `'left'` |
| col | `ColProps` | Grid column properties | - |
| rule | `Rule[]` | Validation rules | - |
| itemRender | `ItemRender` | Field renderer configuration | - |
| tooltipConfig | `TooltipConfig` | Tooltip configuration | - |
| slots | `object` | Custom slot renderers | - |

#### Built-in Renderers

- `$input`: Input field
- `$textarea`: Textarea field  
- `$number`: Number input
- `$select`: Select dropdown
- `$date`: Date picker
- `$range`: Date range picker
- `$time`: Time picker
- `ASwitch`: Switch component
- `ACheckbox`: Checkbox
- `ARate`: Rate component
- `ASlider`: Slider component

#### Basic Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { PFormProps } from '@vue-ui-kit/ant';

interface UserForm {
  name: string;
  email: string;
  age?: number;
  gender: string;
  skills: string[];
}

const formData = ref<UserForm>({
  name: '',
  email: '',
  age: undefined,
  gender: '',
  skills: [],
});

const formSetting = computed<PFormProps<UserForm>>(() => ({
  items: [
    {
      field: 'name',
      title: 'Name',
      span: 12,
      rule: [{ required: true, message: 'Please enter name' }],
      itemRender: {
        name: '$input',
        props: { placeholder: 'Enter name' },
      },
    },
    {
      field: 'email',
      title: 'Email',
      span: 12,
      rule: [
        { required: true, message: 'Please enter email' },
        { type: 'email', message: 'Invalid email format' },
      ],
      itemRender: {
        name: '$input',
        props: { placeholder: 'Enter email' },
      },
    },
    {
      field: 'gender',
      title: 'Gender',
      span: 12,
      rule: [{ required: true, message: 'Please select gender' }],
      itemRender: {
        name: '$select',
        props: {
          placeholder: 'Select gender',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
      },
    },
    {
      field: 'skills',
      title: 'Skills',
      span: 24,
      itemRender: {
        name: '$select',
        props: {
          mode: 'multiple',
          placeholder: 'Select skills',
          options: [
            { label: 'Vue.js', value: 'vue' },
            { label: 'React', value: 'react' },
            { label: 'Angular', value: 'angular' },
          ],
        },
      },
    },
  ],
}));

const handleSubmit = (data: UserForm) => {
  console.log('Form submitted:', data);
};
</script>

<template>
  <p-form 
    v-bind="formSetting" 
    :data="formData"
    @apply="handleSubmit"
  />
</template>
```

#### Advanced Example with Custom Slots

```vue
<script setup lang="tsx">
import { ref, computed } from 'vue';

const formData = ref({
  name: '',
  isActive: false,
});

const formSetting = computed(() => ({
  items: [
    {
      field: 'isActive',
      title: 'Status',
      span: 24,
      slots: {
        default: ({ data }) => (
          <a-switch
            v-model:checked={data.isActive}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        ),
      },
    },
  ],
}));
</script>
```

### PFormGroup

Dynamic form group component for managing multiple form instances with add/remove capabilities.

#### Props

| Prop | Type | Description | Default |
| --- | --- | --- | --- |
| v-model | `Array<T & { __index: number }>` | Form group data array | `[]` |
| getFormSetting | `(data: T) => PFormProps<T>` | Function to get form configuration | - |
| title | `string` | Group title | - |
| tabLabel | `string` | Custom tab label template | - |
| editAble | `boolean` | Whether tabs are editable | `true` |
| showAdd | `boolean` | Show add button | `true` |
| lazyErrorMark | `boolean` | Lazy error marking | `false` |
| forceRender | `boolean` | Force render all tabs | `false` |
| keepSerial | `boolean` | Keep serial indexing | `false` |
| loading | `boolean` | Loading state | `false` |
| max | `number` | Maximum number of items | `Infinity` |
| itemMenus | `GroupMenuItem[]` | Custom menu items | Default copy/delete |
| createItem | `(opts: { list: T[] }) => Promise<T>` | Custom item creator | - |
| menuHandler | `GroupMenuItemHandler<T>` | Custom menu handler | - |

#### Exposed Methods

| Method | Description | Parameters | Returns |
| --- | --- | --- | --- |
| validateAll | Validate all form instances | - | `Promise<void>` |
| validate | Validate specific form instance | `__index: number` | `Promise<void>` |
| setActiveKey | Set active tab | `key: number` | `void` |

#### Basic Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { PFormGroupProps } from '@vue-ui-kit/ant';

interface Project {
  __index: number;
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;
}

const projects = ref<Project[]>([
  {
    __index: 0,
    name: 'Project A',
    startDate: '',
    endDate: '',
    budget: undefined,
  }
]);

const groupSetting = computed<PFormGroupProps<Project>>(() => ({
  title: 'Project Management',
  showAdd: true,
  max: 10,
  getFormSetting: (data) => ({
    items: [
      {
        field: 'name',
        title: 'Project Name',
        span: 24,
        rule: [{ required: true, message: 'Please enter project name' }],
        itemRender: {
          name: '$input',
          props: { placeholder: 'Enter project name' },
        },
      },
      {
        field: 'startDate',
        title: 'Start Date',
        span: 12,
        rule: [{ required: true, message: 'Please select start date' }],
        itemRender: {
          name: '$date',
          props: { placeholder: 'Select start date' },
        },
      },
      {
        field: 'endDate',
        title: 'End Date',
        span: 12,
        rule: [{ required: true, message: 'Please select end date' }],
        itemRender: {
          name: '$date',
          props: { placeholder: 'Select end date' },
        },
      },
      {
        field: 'budget',
        title: 'Budget',
        span: 24,
        itemRender: {
          name: '$number',
          props: {
            min: 0,
            placeholder: 'Enter budget',
            formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
          },
        },
      },
    ],
  }),
}));

const handleSave = async () => {
  try {
    await groupRef.value?.validateAll();
    console.log('All projects saved:', projects.value);
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

const groupRef = ref();
</script>

<template>
  <div>
    <p-form-group 
      ref="groupRef"
      v-model="projects"
      v-bind="groupSetting"
    />
    <a-button type="primary" @click="handleSave">
      Save All Projects
    </a-button>
  </div>
</template>
```

#### Advanced Example with Custom Menu

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const projects = ref([]);

const groupSetting = computed(() => ({
  title: 'Advanced Project Management',
  itemMenus: [
    { content: 'Copy', code: 'copy' },
    { content: 'Delete', code: 'delete' },
    { content: 'Export', code: 'export' },
    { 
      content: 'Archive', 
      code: 'archive',
      visibleMethod: ({ data }) => data.status !== 'archived'
    },
  ],
  createItem: async ({ list }) => {
    return {
      name: `Project ${list.length + 1}`,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    };
  },
  menuHandler: ({ code, data, index }) => {
    switch (code) {
      case 'export':
        exportProject(data);
        break;
      case 'archive':
        archiveProject(data, index);
        break;
    }
  },
  getFormSetting: (data) => ({
    // ... form configuration
  }),
}));
</script>
```

## Utility Functions

### labelColDict

Pre-defined label column configurations for different text lengths:

```ts
import { labelColDict } from '@vue-ui-kit/ant';

// Usage in form items
{
  field: 'shortField',
  title: 'Name', // 2 characters
  labelCol: labelColDict[2],
}

{
  field: 'longerField', 
  title: 'Description', // 4+ characters
  labelCol: labelColDict[4],
}
```

### Custom Renderers

Register custom form field renderers:

```tsx
import UIKit from '@vue-ui-kit/ant';
import { Switch } from 'ant-design-vue';

UIKit.addRender('$switch', {
  renderItemContent(
    { props = {}, events = {} },
    { data, field }
  ) {
    return (
      <Switch
        v-model:checked={data[field]}
        {...props}
        onChange={(...args) => {
          events.change?.({ data, field }, ...args);
        }}
      />
    );
  },
});
```

### Custom Formatters

Register custom cell formatters for PGrid:

```ts
UIKit.addFormatter({
  currency: ({ cellValue }) => `$${cellValue?.toLocaleString() || '0'}`,
  percentage: ({ cellValue }) => `${(cellValue * 100).toFixed(2)}%`,
});
```

## FAQ

### 1. When using computed + v-bind to generate dynamic tables + forms, form option updates cause table re-rendering. How to solve?

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

Answer: It simplifies all dynamic logic. For complex scenarios, you can try using reactive and maintain it yourself, but in most cases, computed is more convenient.

## TypeScript Support

This library is fully written in TypeScript and provides comprehensive type definitions:

```ts
import type { 
  PFormProps, 
  PFormItemProps,
  PFormGroupProps,
  PGridProps,
  ColumnProps 
} from '@vue-ui-kit/ant';
```

## License

MIT
