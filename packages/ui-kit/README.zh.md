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

### PGrid

增强的数据表格组件，集成了查询表单、分页和工具栏功能。

#### 基础示例

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { PGridProps, labelColDict } from '@vue-ui-kit/ant';

const gridSetting = computed<PGridProps<Student, { keyword?: string }>>(() => ({
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
        labelCol: labelColDict[3],
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入关键字...' },
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

增强的表单组件，具有简化的配置和动态字段功能。

#### 属性

| 属性 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| items | `PFormItemProps[]` | 表单项配置数组 | - |
| data | `T` | 表单数据对象 | - |
| customReset | `() => void` | 自定义重置函数 | - |
| labelCol | `ColProps` | 标签列布局 | `{ span: 6 }` |
| wrapperCol | `ColProps` | 包装列布局 | `{ span: 16 }` |
| ...其他 | `FormProps` | 所有 ant-design-vue Form 的属性 | - |

#### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| apply | 表单提交时触发 | `(formData: T) => void` |
| reset | 表单重置时触发 | `() => void` |

#### PFormItemProps

| 属性 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| field | `string` | 表单字段名 | - |
| title | `string` | 字段标签 | - |
| span | `number` | 栅格跨度 (1-24) | - |
| colon | `boolean` | 标签后显示冒号 | `true` |
| labelCol | `ColProps` | 标签列布局 | - |
| wrapperCol | `ColProps` | 包装列布局 | - |
| forceRequired | `boolean` | 显示必填标记（仅视觉效果） | `false` |
| align | `'left' \| 'right' \| 'center'` | 文本对齐方式 | `'left'` |
| col | `ColProps` | 栅格列属性 | - |
| rule | `Rule[]` | 验证规则 | - |
| itemRender | `ItemRender` | 字段渲染器配置 | - |
| tooltipConfig | `TooltipConfig` | 提示配置 | - |
| slots | `object` | 自定义插槽渲染器 | - |

#### 内置渲染器

- `$input`: 输入框
- `$textarea`: 文本域
- `$number`: 数字输入框
- `$select`: 下拉选择
- `$date`: 日期选择器
- `$range`: 日期范围选择器
- `$time`: 时间选择器
- `ASwitch`: 开关组件
- `ACheckbox`: 复选框
- `ARate`: 评分组件
- `ASlider`: 滑动输入条

#### 基础示例

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
      title: '姓名',
      span: 12,
      rule: [{ required: true, message: '请输入姓名' }],
      itemRender: {
        name: '$input',
        props: { placeholder: '请输入姓名' },
      },
    },
    {
      field: 'email',
      title: '邮箱',
      span: 12,
      rule: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' },
      ],
      itemRender: {
        name: '$input',
        props: { placeholder: '请输入邮箱' },
      },
    },
    {
      field: 'gender',
      title: '性别',
      span: 12,
      rule: [{ required: true, message: '请选择性别' }],
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
      field: 'skills',
      title: '技能',
      span: 24,
      itemRender: {
        name: '$select',
        props: {
          mode: 'multiple',
          placeholder: '请选择技能',
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
  console.log('表单提交:', data);
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

#### 自定义插槽示例

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
      title: '状态',
      span: 24,
      slots: {
        default: ({ data }) => (
          <a-switch
            v-model:checked={data.isActive}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        ),
      },
    },
  ],
}));
</script>
```

### PFormGroup

动态表单组组件，用于管理多个表单实例，支持添加/删除功能。

#### 属性

| 属性 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| v-model | `Array<T & { __index: number }>` | 表单组数据数组 | `[]` |
| getFormSetting | `(data: T) => PFormProps<T>` | 获取表单配置的函数 | - |
| title | `string` | 组标题 | - |
| tabLabel | `string` | 自定义标签页标签模板 | - |
| editAble | `boolean` | 标签页是否可编辑 | `true` |
| showAdd | `boolean` | 显示添加按钮 | `true` |
| lazyErrorMark | `boolean` | 延迟错误标记 | `false` |
| forceRender | `boolean` | 强制渲染所有标签页 | `false` |
| keepSerial | `boolean` | 保持连续编号 | `false` |
| loading | `boolean` | 加载状态 | `false` |
| max | `number` | 最大项目数量 | `Infinity` |
| itemMenus | `GroupMenuItem[]` | 自定义菜单项 | 默认复制/删除 |
| createItem | `(opts: { list: T[] }) => Promise<T>` | 自定义项目创建器 | - |
| menuHandler | `GroupMenuItemHandler<T>` | 自定义菜单处理器 | - |

#### 暴露的方法

| 方法 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| validateAll | 验证所有表单实例 | - | `Promise<void>` |
| validate | 验证特定表单实例 | `__index: number` | `Promise<void>` |
| setActiveKey | 设置活动标签页 | `key: number` | `void` |

#### 基础示例

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
    name: '项目A',
    startDate: '',
    endDate: '',
    budget: undefined,
  }
]);

const groupSetting = computed<PFormGroupProps<Project>>(() => ({
  title: '项目管理',
  showAdd: true,
  max: 10,
  getFormSetting: (data) => ({
    items: [
      {
        field: 'name',
        title: '项目名称',
        span: 24,
        rule: [{ required: true, message: '请输入项目名称' }],
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入项目名称' },
        },
      },
      {
        field: 'startDate',
        title: '开始日期',
        span: 12,
        rule: [{ required: true, message: '请选择开始日期' }],
        itemRender: {
          name: '$date',
          props: { placeholder: '请选择开始日期' },
        },
      },
      {
        field: 'endDate',
        title: '结束日期',
        span: 12,
        rule: [{ required: true, message: '请选择结束日期' }],
        itemRender: {
          name: '$date',
          props: { placeholder: '请选择结束日期' },
        },
      },
      {
        field: 'budget',
        title: '预算',
        span: 24,
        itemRender: {
          name: '$number',
          props: {
            min: 0,
            placeholder: '请输入预算',
            formatter: (value) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value.replace(/￥\s?|(,*)/g, ''),
          },
        },
      },
    ],
  }),
}));

const handleSave = async () => {
  try {
    await groupRef.value?.validateAll();
    console.log('所有项目已保存:', projects.value);
  } catch (error) {
    console.error('验证失败:', error);
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
      保存所有项目
    </a-button>
  </div>
</template>
```

#### 自定义菜单示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const projects = ref([]);

const groupSetting = computed(() => ({
  title: '高级项目管理',
  itemMenus: [
    { content: '复制', code: 'copy' },
    { content: '删除', code: 'delete' },
    { content: '导出', code: 'export' },
    { 
      content: '归档', 
      code: 'archive',
      visibleMethod: ({ data }) => data.status !== 'archived'
    },
  ],
  createItem: async ({ list }) => {
    return {
      name: `项目 ${list.length + 1}`,
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
    // ... 表单配置
  }),
}));
</script>
```

## 工具函数

### labelColDict

为不同文本长度预定义的标签列配置：

```ts
import { labelColDict } from '@vue-ui-kit/ant';

// 在表单项中使用
{
  field: 'shortField',
  title: '姓名', // 2个字符
  labelCol: labelColDict[2],
}

{
  field: 'longerField', 
  title: '项目描述', // 4+个字符
  labelCol: labelColDict[4],
}
```

### 自定义渲染器

注册自定义表单字段渲染器：

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

### 自定义格式化器

为 PGrid 注册自定义单元格格式化器：

```ts
UIKit.addFormatter({
  currency: ({ cellValue }) => `￥${cellValue?.toLocaleString() || '0'}`,
  percentage: ({ cellValue }) => `${(cellValue * 100).toFixed(2)}%`,
});
```

## 常见问题

### 1. 使用 computed + v-bind 生成动态表格+表单时，表单选项更新导致表格重新渲染，如何解决？

答案：将 formConfig 分离为另一个计算属性

```vue
<p-grid v-bind="gridSetting" :form-config="computedFormConfig" />
```

### 2. 表格 ajax 目前只支持 multiDelete 和表格数据获取吗？

答案：编辑详情在大多数情况下无法与表格一一对应，所以没有开发意义。多行删除需要配合使用：

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

### 3. 为什么推荐 computed 方式？

答案：它简化了所有动态逻辑。对于复杂场景，您可以尝试使用 reactive 并自己维护，但在大多数情况下，computed 更方便。

## TypeScript 支持

该库完全使用 TypeScript 编写，并提供全面的类型定义：

```ts
import type { 
  PFormProps, 
  PFormItemProps,
  PFormGroupProps,
  PGridProps,
  ColumnProps 
} from '@vue-ui-kit/ant';
```

## 许可证

MIT
