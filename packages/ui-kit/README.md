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

## Quick Start

### 1. Basic Usage

```ts
/*main.ts*/
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import UIKit from '@vue-ui-kit/ant';

// Import styles - choose one of the following methods:
// Method 1: Import SCSS source files (for development, allows variable override)
import '@vue-ui-kit/ant/style.scss';

// Method 1.1: Import compiled SCSS file (for production, standalone file)
// import '@vue-ui-kit/ant/dist/style.scss';

// Method 2: Import compiled CSS file
// import '@vue-ui-kit/ant/style.css';

createApp(App).use(Antd).use(UIKit).mount('#app');
```

### 2. Configure Global Defaults

```ts
/*main.ts*/
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import UIKit, { setup } from '@vue-ui-kit/ant';
import '@vue-ui-kit/ant/style.scss';

// Configure global defaults
setup({
  form: {
    labelCol: { span: 8 }, // Modify form label column width
    wrapperCol: { span: 14 }, // Modify form input column width
  },
  grid: {
    align: 'center', // Set default table alignment
    lazyReset: true, // Don't auto-submit after reset
    fitHeight: 200, // Set adaptive height
  },
});

createApp(App).use(Antd).use(UIKit).mount('#app');
```

### 3. Alternative import methods (if main method doesn't work)

If you encounter issues with the standard import, try these alternatives:

```scss
// In your main.scss file
@use '@vue-ui-kit/ant/dist/style.scss';
// or
@import '@vue-ui-kit/ant/dist/style.scss';
```

```ts
// Or using require in JavaScript/TypeScript
require('@vue-ui-kit/ant/style.css');
```

### 4. For Vite users

If using Vite, make sure your vite.config.js includes sass support:

```js
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@vue-ui-kit/ant/dist/style.scss';`,
      },
    },
  },
};
```

## 🎯 样式文件导入 - 故障排除指南

如果遇到样式文件导入问题，请按顺序尝试以下方法：

### 方法1: 标准导入（推荐）

```typescript
import '@vue-ui-kit/ant/style.scss';
// 或
import '@vue-ui-kit/ant/style.css';
```

### 方法2: 完整路径导入

```typescript
import '@vue-ui-kit/ant/dist/style.scss';
// 或
import '@vue-ui-kit/ant/dist/style.css';
```

### 方法3: SCSS @use 语法

```scss
// 开发环境（源码文件）
@use '@vue-ui-kit/ant/style.scss';

// 生产环境（编译后的独立文件）
@use '@vue-ui-kit/ant/dist/style.scss';
```

### 方法4: 在 style 标签中

```vue
<style lang="scss">
  @import '@vue-ui-kit/ant/style.scss';
</style>
```

### 方法5: Vite 配置导入

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@vue-ui-kit/ant/dist/style.scss';`,
      },
    },
  },
});
```

### 方法6: Webpack 配置

```javascript
// webpack.config.js 或 vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import '@vue-ui-kit/ant/dist/style.scss';`,
      },
    },
  },
};
```

### 🔧 调试步骤

1. **检查包版本**: 确保使用 `@vue-ui-kit/ant@1.8.4` 或更高版本
2. **验证文件存在**: 检查 `node_modules/@vue-ui-kit/ant/dist/` 目录下是否有 `style.scss` 和 `style.css`
3. **检查构建工具**: 确保您的构建工具支持处理 `.scss` 文件
4. **清除缓存**: 删除 `node_modules` 和 lock 文件后重新安装

### 📦 包内容确认

安装后可以在以下位置找到样式文件：

```
node_modules/@vue-ui-kit/ant/
├── dist/
│   ├── style.css      # 编译后的CSS
│   └── style.scss     # SCSS源文件
└── src/packages/styles/  # 源文件(开发时参考)
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

| Prop        | Type               | Description                    | Default        |
| ----------- | ------------------ | ------------------------------ | -------------- |
| items       | `PFormItemProps[]` | Form items configuration array | -              |
| data        | `T`                | Form data object               | -              |
| customReset | `() => void`       | Custom reset function          | -              |
| labelCol    | `ColProps`         | Label column layout            | `{ span: 6 }`  |
| wrapperCol  | `ColProps`         | Wrapper column layout          | `{ span: 16 }` |
| ...others   | `FormProps`        | All ant-design-vue Form props  | -              |

#### Events

| Event | Description                      | Parameters              |
| ----- | -------------------------------- | ----------------------- |
| apply | Triggered when form is submitted | `(formData: T) => void` |
| reset | Triggered when form is reset     | `() => void`            |

#### PFormItemProps

| Prop          | Type                            | Description                      | Default  |
| ------------- | ------------------------------- | -------------------------------- | -------- |
| field         | `string`                        | Form field name                  | -        |
| title         | `string`                        | Field label                      | -        |
| span          | `number`                        | Grid span (1-24)                 | -        |
| colon         | `boolean`                       | Show colon after label           | `true`   |
| labelCol      | `ColProps`                      | Label column layout              | -        |
| wrapperCol    | `ColProps`                      | Wrapper column layout            | -        |
| forceRequired | `boolean`                       | Show required mark (visual only) | `false`  |
| align         | `'left' \| 'right' \| 'center'` | Text alignment                   | `'left'` |
| col           | `ColProps`                      | Grid column properties           | -        |
| rule          | `Rule[]`                        | Validation rules                 | -        |
| itemRender    | `ItemRender`                    | Field renderer configuration     | -        |
| tooltipConfig | `TooltipConfig`                 | Tooltip configuration            | -        |
| slots         | `object`                        | Custom slot renderers            | -        |

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
  <p-form v-bind="formSetting" :data="formData" @apply="handleSubmit" />
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

| Method       | Description                     | Parameters        | Returns         |
| ------------ | ------------------------------- | ----------------- | --------------- |
| validateAll  | Validate all form instances     | -                 | `Promise<void>` |
| validate     | Validate specific form instance | `__index: number` | `Promise<void>` |
| setActiveKey | Set active tab                  | `key: number`     | `void`          |

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
    },
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
    <p-form-group ref="groupRef" v-model="projects" v-bind="groupSetting" />
    <a-button type="primary" @click="handleSave"> Save All Projects </a-button>
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
        visibleMethod: ({ data }) => data.status !== 'archived',
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
  renderItemContent({ props = {}, events = {} }, { data, field }) {
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

## 🔤 TypeScript 类型使用

### 基本类型导入

```typescript
import {
  PGridProps,
  PFormProps,
  PFormItemProps,
  ColumnProps,
  ToolbarConfig,
  UIKitConfig,
} from '@vue-ui-kit/ant';
```

### PGrid 类型使用示例

```typescript
import { computed } from 'vue';
import { PGridProps } from '@vue-ui-kit/ant';

// 定义数据类型
interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 定义查询表单类型
interface StudentQuery {
  keyword?: string;
  age?: number;
}

// 使用PGridProps类型
const gridSetting = computed<PGridProps<Student, StudentQuery>>(() => ({
  columns: [
    { field: 'name', title: '姓名', width: 200 },
    { field: 'email', title: '邮箱', width: 200 },
    { field: 'age', title: '年龄', width: 100 },
  ],
  formConfig: {
    items: [
      {
        field: 'keyword',
        title: '关键字',
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入关键字' },
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
```

### PForm 类型使用示例

```typescript
import { ref, computed } from 'vue';
import { PFormProps, PFormItemProps } from '@vue-ui-kit/ant';

// 定义表单数据类型
interface UserForm {
  name: string;
  email: string;
  age?: number;
  gender: string;
}

const formData = ref<UserForm>({
  name: '',
  email: '',
  age: undefined,
  gender: '',
});

// 使用PFormProps类型
const formSetting = computed<PFormProps<UserForm>>(() => ({
  items: [
    {
      field: 'name',
      title: '姓名',
      rule: [{ required: true, message: '请输入姓名' }],
      itemRender: {
        name: '$input',
        props: { placeholder: '请输入姓名' },
      },
    },
    {
      field: 'email',
      title: '邮箱',
      rule: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' },
      ],
      itemRender: {
        name: '$input',
        props: { placeholder: '请输入邮箱' },
      },
    },
  ] as PFormItemProps<UserForm>[],
}));
```

### 高级类型使用

```typescript
// 1. 自定义列类型
import { ColumnProps } from '@vue-ui-kit/ant';

const customColumns: ColumnProps<Student>[] = [
  {
    field: 'name',
    title: '姓名',
    formatter: (arg) => arg.cellValue?.toUpperCase(),
  },
  {
    field: 'actions',
    title: '操作',
    slots: {
      default: ({ row, rowIndex }) => (
        <button onClick={() => handleEdit(row)}>编辑</button>
      ),
    },
  },
];

// 2. 工具栏配置类型
import { ToolbarConfig } from '@vue-ui-kit/ant';

const toolbarConfig: ToolbarConfig = {
  buttons: [
    {
      code: 'add',
      content: '新增',
      type: 'primary',
      icon: 'PlusOutlined',
    },
  ],
  tools: [
    {
      code: 'refresh',
      icon: 'ReloadOutlined',
    },
  ],
};

// 3. Setup配置类型
import { UIKitConfig } from '@vue-ui-kit/ant';

const kitConfig: UIKitConfig = {
  form: {
    labelCol: { span: 8 },
    wrapperCol: { span: 14 },
  },
  grid: {
    align: 'center',
    lazyReset: true,
    fitHeight: 200,
  },
};
```

### 组件实例类型

```typescript
import { ref } from 'vue';
import { PGridInstance, PFormInstance } from '@vue-ui-kit/ant';

// PGrid 组件实例
const gridRef = ref<PGridInstance<Student, StudentQuery>>();

// 调用实例方法
gridRef.value?.commitProxy.reload();
gridRef.value?.resizeTable();

// PForm 组件实例
const formRef = ref<PFormInstance>();

// 调用实例方法
formRef.value?.reset();
formRef.value?.$form.validateFields();
```

## TypeScript Support

This library is fully written in TypeScript and provides comprehensive type definitions:

```ts
import type {
  PFormProps,
  PFormItemProps,
  PFormGroupProps,
  PGridProps,
  ColumnProps,
} from '@vue-ui-kit/ant';
```

## License

MIT

### 🛠️ 工具方法使用

#### 从npm包导入工具方法

```typescript
import {
  // 响应式布局工具
  getButtonResponsive,
  defaultItemResponsive,
  defaultLabelCol,
  labelColDict,
  get24rest,

  // 表格工具
  cleanCol,

  // 其他工具
  UIKitConfig,
  setup,
} from '@vue-ui-kit/ant';
```

#### getButtonResponsive 使用示例

```typescript
import { getButtonResponsive, defaultItemResponsive } from '@vue-ui-kit/ant';

// 方式1: 根据表单项数量自动计算按钮响应式布局
const buttonSpan1 = getButtonResponsive(3); // 3个表单项
console.log(buttonSpan1);
// 结果: { xs: 24, sm: 24, md: 24, lg: 0, xl: 0, xxl: 6 }

// 方式2: 传入自定义响应式配置数组
const customResponsive = [
  { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 },
  { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 },
];
const buttonSpan2 = getButtonResponsive(customResponsive);
console.log(buttonSpan2);
// 计算剩余空间作为按钮区域
```

#### labelColDict 使用示例

```typescript
import { labelColDict } from '@vue-ui-kit/ant';

// 根据标签字符数获取合适的labelCol配置
const labelCol = labelColDict[4]; // 4个字符的标签
console.log(labelCol);
// 结果: { xs: 12, sm: 4, md: 6, lg: 9, xl: 7, xxl: 6 }

// 在表单配置中使用
const formSetting = computed(() => ({
  items: [
    {
      field: 'username',
      title: '用户名称', // 4个字符
      labelCol: labelColDict[4],
      itemRender: {
        name: '$input',
        props: { placeholder: '请输入用户名称' },
      },
    },
  ],
}));
```

#### 响应式布局工具完整示例

```typescript
import { getButtonResponsive, defaultItemResponsive, labelColDict } from '@vue-ui-kit/ant';

// 创建一个动态表单布局计算器
function createFormLayout(items: Array<{ title: string }>) {
  return {
    // 表单项布局
    items: items.map((item) => ({
      ...item,
      col: defaultItemResponsive, // 使用默认响应式布局
      labelCol: labelColDict[item.title.length] || labelColDict[4], // 根据标题长度选择
    })),

    // 按钮区域布局
    buttonCol: getButtonResponsive(items.length),
  };
}

// 使用示例
const layout = createFormLayout([{ title: '姓名' }, { title: '邮箱地址' }, { title: '手机号码' }]);

console.log('按钮布局:', layout.buttonCol);
// 自动计算最后一行剩余空间给按钮使用
```

#### cleanCol 表格列处理

```typescript
import { cleanCol, type ColumnProps } from '@vue-ui-kit/ant';

// 自定义列配置
const customColumn: ColumnProps<User> = {
  field: 'name',
  title: '用户名',
  formatter: 'capitalize',
  cellRender: {
    name: '$link',
    props: { href: '#' },
  },
  slots: {
    default: ({ row }) => <span>{row.name}</span>,
  },
};

// 清理列配置，移除UI Kit特有属性，转换为Ant Design Vue标准格式
const antColumn = cleanCol(customColumn);
console.log(antColumn);
// 结果会移除 formatter, cellRender, slots 等UI Kit特有属性
// 保留 Ant Design Vue 原生支持的属性
```

#### get24rest 栅格计算

```typescript
import { get24rest } from '@vue-ui-kit/ant';

// 计算24栅格系统中的剩余空间
const usedSpans = [6, 8, 4]; // 已使用的栅格数
const restSpan = get24rest(usedSpans);
console.log(restSpan); // 结果: 6 (24 - 6 - 8 - 4 = 6)

// 在表单中动态计算按钮位置
const formItems = [
  { span: 8 }, // 表单项1
  { span: 8 }, // 表单项2
  { span: 6 }, // 表单项3
];
const buttonSpan = get24rest(formItems.map((item) => item.span));
// 按钮将占据剩余的2格空间，如果小于等于1则占满整行(24格)
```

#### 在Vue组件中使用

```vue
<template>
  <div>
    <a-row :gutter="[16, 16]">
      <!-- 动态表单项 -->
      <a-col v-for="(item, index) in formItems" :key="index" v-bind="defaultItemResponsive">
        <a-form-item :label="item.label" :label-col="getLabelCol(item.label)">
          <a-input v-model:value="item.value" />
        </a-form-item>
      </a-col>

      <!-- 动态按钮区域 -->
      <a-col v-bind="buttonLayout">
        <a-button type="primary">提交</a-button>
        <a-button>重置</a-button>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { getButtonResponsive, defaultItemResponsive, labelColDict } from '@vue-ui-kit/ant';

  const formItems = ref([
    { label: '姓名', value: '' },
    { label: '电子邮箱', value: '' },
    { label: '联系电话', value: '' },
  ]);

  // 动态计算按钮布局
  const buttonLayout = computed(() => getButtonResponsive(formItems.value.length));

  // 根据标签长度获取合适的labelCol
  const getLabelCol = (label: string) => labelColDict[label.length] || labelColDict[4];
</script>
```

## 📦 组件和工具导入

### ✅ 正确的导入方式

```typescript
// 方式1: 分别导入 (推荐)
import {
  // 组件
  PForm,
  PGrid,
  PFormGroup,
  PGroupBlock,
  PromisePicker,

  // 类型
  PGridProps,
  PFormProps,
  PFormItemProps,
  ColumnProps,
  UIKitConfig,

  // 工具方法
  getButtonResponsive,
  labelColDict,
  defaultItemResponsive,
  get24rest,
  cleanCol,

  // 配置方法
  setup,
  addFormatter,
  addRender,
} from '@vue-ui-kit/ant';

// 方式2: 默认导入 + 命名导入
import UIKit, { PForm, PGrid, setup } from '@vue-ui-kit/ant';
```

### 🔧 完整使用示例

```vue
<template>
  <div class="demo-page">
    <!-- PForm 组件 -->
    <PForm
      ref="formRef"
      v-bind="formSetting"
      :data="formData"
      @apply="handleFormSubmit"
      @reset="handleFormReset"
    />

    <!-- PGrid 组件 -->
    <PGrid ref="gridRef" v-bind="gridSetting" @toolbar-button-click="handleToolbarClick" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    // 直接导入组件
    PForm,
    PGrid,

    // 导入类型
    PFormProps,
    PGridProps,
    PFormInstance,
    PGridInstance,

    // 导入工具方法
    getButtonResponsive,
    labelColDict,

    // 导入配置方法
    setup,
  } from '@vue-ui-kit/ant';

  // 配置全局默认值
  setup({
    grid: {
      align: 'center',
      fitHeight: 180,
    },
    form: {
      labelCol: labelColDict[4],
    },
  });

  // 类型定义
  interface User {
    id: number;
    name: string;
    email: string;
  }

  interface UserForm {
    name: string;
    email: string;
  }

  interface UserQuery {
    keyword?: string;
  }

  // 组件引用
  const formRef = ref<PFormInstance>();
  const gridRef = ref<PGridInstance<User, UserQuery>>();

  // 表单数据
  const formData = ref<UserForm>({
    name: '',
    email: '',
  });

  // 表单配置
  const formSetting = computed<PFormProps<UserForm>>(() => ({
    items: [
      {
        field: 'name',
        title: '用户名',
        labelCol: labelColDict[3], // 3个字符的标签
        rule: [{ required: true, message: '请输入用户名' }],
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入用户名' },
        },
      },
      {
        field: 'email',
        title: '邮箱地址',
        labelCol: labelColDict[4], // 4个字符的标签
        rule: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ],
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入邮箱地址' },
        },
      },
    ],
  }));

  // 网格配置
  const gridSetting = computed<PGridProps<User, UserQuery>>(() => ({
    columns: [
      { field: 'name', title: '用户名', width: 200 },
      { field: 'email', title: '邮箱', width: 200 },
    ],
    formConfig: {
      items: [
        {
          field: 'keyword',
          title: '关键字',
          labelCol: labelColDict[3],
          itemRender: {
            name: '$input',
            props: { placeholder: '请输入关键字' },
          },
        },
      ],
    },
    toolbarConfig: {
      buttons: [
        {
          code: 'add',
          content: '新增',
          type: 'primary',
          icon: 'PlusOutlined',
        },
      ],
    },
    proxyConfig: {
      ajax: {
        query: ({ form, page }) => api.getUsers({ ...form, ...page }),
      },
    },
  }));

  // 事件处理
  const handleFormSubmit = (data: UserForm) => {
    console.log('表单提交:', data);
  };

  const handleFormReset = () => {
    console.log('表单重置');
  };

  const handleToolbarClick = ({ code, data, selectedKeys }) => {
    console.log('工具栏点击:', { code, data, selectedKeys });

    if (code === 'add') {
      // 处理新增逻辑
    }
  };

  // 使用工具方法
  const buttonLayout = computed(
    () => getButtonResponsive(2), // 根据表单项数量计算按钮布局
  );
</script>
```

### 🚨 常见导入错误

```typescript
// ❌ 错误：这样无法导入组件
import { PForm, PGrid } from '@vue-ui-kit/ant/components';

// ❌ 错误：组件不能从utils路径导入
import { PForm } from '@vue-ui-kit/ant/utils';

// ❌ 错误：混合默认导入和组件导入
import UIKit, PForm from '@vue-ui-kit/ant'; // 语法错误

// ✅ 正确：从主包路径导入所有内容
import {
  PForm,
  PGrid,
  getButtonResponsive,
  labelColDict
} from '@vue-ui-kit/ant';
```

### 📋 可导入的完整列表

#### 组件

- `PForm` - 增强表单组件
- `PGrid` - 增强数据表格组件
- `PFormGroup` - 动态表单组组件
- `PGroupBlock` - 表单块组件
- `PromisePicker` - 数据选择器组件

#### 类型定义

- `PFormProps<T>` - 表单属性类型
- `PGridProps<D, F>` - 网格属性类型
- `PFormInstance` - 表单实例类型
- `PGridInstance<D, F>` - 网格实例类型
- `ColumnProps<T>` - 列配置类型
- `UIKitConfig` - 全局配置类型

#### 工具方法

- `getButtonResponsive()` - 计算按钮响应式布局
- `labelColDict` - 标签宽度配置字典
- `defaultItemResponsive` - 默认响应式配置
- `get24rest()` - 栅格剩余空间计算
- `cleanCol()` - 清理列配置

#### 配置方法

- `setup()` - 全局配置设置
- `addFormatter()` - 添加格式化器
- `addRender()` - 添加渲染器
