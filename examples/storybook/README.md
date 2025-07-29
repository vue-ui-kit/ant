# Vue UI Kit Storybook 示例

这是一个展示 Vue UI Kit 组件库功能的示例项目，包含了各种组件的使用示例和 Mock 数据接口。

## 项目结构

```
src/
├── App.vue                    # 主应用组件，通过 v-if 管理不同示例的展示
├── main.ts                    # 应用入口文件
├── style.css                  # 全局样式
├── view/                      # 示例组件目录
│   ├── PGridExample.vue       # PGrid 增强数据表格示例
│   ├── PFormExample.vue       # PForm 增强表单示例
│   ├── PFormGroupExample.vue  # PFormGroup 动态表单组示例
│   ├── PCanvasTableExample.vue # PCanvasTable Canvas虚拟表格示例
│   └── PromisePickerExample.vue # PromisePicker 数据选择器示例
└── Mock/                      # Mock 数据接口目录
    ├── apis/                  # API 接口定义
    │   ├── index.ts           # 统一导出文件
    │   ├── type.d.ts          # 类型定义
    │   ├── school.ts          # 学校相关接口
    │   ├── user.ts            # 用户相关接口
    │   ├── project.ts         # 项目相关接口
    │   └── order.ts           # 订单相关接口
    ├── mockTool.ts            # Mock 工具函数
    └── setup.tsx              # Mock 设置文件
```

## 功能特性

### 1. 组件化示例

- 每个功能模块都被封装成独立的 Vue 组件
- 通过 App.vue 中的 v-if 指令管理不同示例的展示
- 便于维护和扩展新的示例

### 2. Mock 数据接口

- **学校数据** (`school.ts`): 学生信息管理
- **用户数据** (`user.ts`): 用户信息管理
- **项目数据** (`project.ts`): 项目管理
- **订单数据** (`order.ts`): 订单管理

### 3. 示例组件

#### PGridExample - 增强数据表格

- 集成了查询表单、分页、工具栏等功能
- 支持关键字搜索
- 支持多选操作
- 包含工具栏按钮事件处理

#### PFormExample - 增强表单

- 基于配置的动态表单组件
- 支持多种字段类型：输入框、数字输入、下拉选择、日期选择、多选、文本域、开关等
- 包含表单验证规则
- 支持表单提交和重置

#### PFormGroupExample - 动态表单组

- 支持动态添加、删除和管理多个表单实例
- 支持标签页切换
- 包含项目信息管理功能
- 支持预算格式化显示

#### PCanvasTableExample - Canvas虚拟表格

- 基于 e-virt-table 的高性能虚拟滚动表格
- 支持大数据量渲染（10000条数据）
- 支持编辑功能
- 包含自定义渲染插槽
- 支持固定列和选择功能

#### PromisePickerExample - 数据选择器

- 基于 Promise 的数据选择器组件
- 支持单选和多选模式
- 包含异步验证功能
- 支持搜索和分页

## 开发指南

### 启动开发服务器

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 技术栈

- **Vue 3.4+**: 使用 Composition API 和 TypeScript
- **Ant Design Vue**: UI 组件库
- **Vite**: 构建工具
- **TypeScript**: 类型安全
- **Vue JSX**: 支持 JSX 语法

## 注意事项

1. 项目使用了较新版本的 Vue 3.4+，可能存在一些 TypeScript 类型兼容性问题
2. 开发时建议跳过 TypeScript 检查，直接使用 Vite 开发服务器
3. Mock 数据接口提供了丰富的测试数据，可以用于各种场景的测试

## 扩展指南

### 添加新的示例组件

1. 在 `src/view/` 目录下创建新的 Vue 组件
2. 在 `App.vue` 中导入新组件
3. 添加对应的导航按钮和展示逻辑

### 添加新的 Mock 接口

1. 在 `src/Mock/apis/` 目录下创建新的接口文件
2. 定义相应的类型和数据结构
3. 在 `src/Mock/apis/index.ts` 中导出新接口

### 自定义组件配置

每个示例组件都包含了详细的配置示例，可以根据实际需求进行调整和扩展。
