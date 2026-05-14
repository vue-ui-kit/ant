<script setup lang="tsx">
  import { computed, h, ref } from 'vue';
  import {
    PDescriptionProps,
    PFormProps,
    PDescriptionItemProps,
    PFormItemProps,
    ItemRender,
  } from '@vue-ui-kit/ant';
  import {
    Card as ACard,
    Button as AButton,
    Space as ASpace,
    Tag as ATag,
    Switch as ASwitch,
    message,
  } from 'ant-design-vue';
  import { CrownOutlined, EditOutlined } from '@ant-design/icons-vue';

  type UserData = {
    name: string;
    email: string;
    age: number;
    gender: string;
    birthday: string;
    skills: string[];
    level: string;
    isActive: boolean;
    address: string;
    bio: string;
  };

  // 数据源
  const userData = ref<UserData>({
    name: '俞宇峰',
    email: 'yu@example.com',
    age: 28,
    gender: 'male',
    birthday: '1996-08-12',
    skills: ['Vue', 'TypeScript', 'Canvas'],
    level: 'gold',
    isActive: true,
    address: '上海市浦东新区张江高科',
    bio: '',
  });

  // 编辑态：操作副本，取消可回退
  const isEditing = ref(false);
  const editingData = ref<UserData>({ ...userData.value });

  const enterEdit = () => {
    editingData.value = JSON.parse(JSON.stringify(userData.value));
    isEditing.value = true;
  };
  const cancelEdit = () => {
    isEditing.value = false;
  };
  const saveEdit = () => {
    userData.value = JSON.parse(JSON.stringify(editingData.value));
    isEditing.value = false;
    message.success('已保存');
  };

  // 演示开关
  const bordered = ref(true);
  const layout = ref<'horizontal' | 'vertical'>('horizontal');

  // 渲染器复用：编辑态用 itemRender，只读态用 readonlyRender
  const genderRender: ItemRender = {
    name: '$select',
    props: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
      placeholder: '请选择性别',
    },
  };
  const birthdayRender: ItemRender = {
    name: '$date',
    props: { format: 'YYYY/MM/DD', placeholder: '请选择生日' },
  };
  const skillsRender: ItemRender = {
    name: '$select',
    props: {
      mode: 'tags',
      placeholder: '请输入技能',
      options: [
        { label: 'Vue', value: 'Vue' },
        { label: 'TypeScript', value: 'TypeScript' },
        { label: 'Canvas', value: 'Canvas' },
        { label: 'React', value: 'React' },
        { label: 'Node.js', value: 'Node.js' },
      ],
    },
  };
  const levelRender: ItemRender = {
    name: '$select',
    props: {
      options: [
        { label: '黄金会员', value: 'gold' },
        { label: '普通用户', value: 'normal' },
      ],
    },
  };
  const activeRender: ItemRender = {
    name: '$switch',
    props: { checkedChildren: '激活', unCheckedChildren: '停用' },
  };

  // PDescription 配置（只读态）
  const descSetting = computed<PDescriptionProps<UserData>>(() => ({
    data: userData.value,
    title: '用户基本信息',
    bordered: bordered.value,
    column: { xs: 1, sm: 2, md: 2, lg: 3 },
    layout: layout.value,
    items: [
      { field: 'name', label: '姓名' },
      { field: 'email', label: '邮箱' },
      { field: 'age', label: '年龄' },
      { field: 'gender', label: '性别', readonlyRender: genderRender },
      { field: 'birthday', label: '生日', readonlyRender: birthdayRender },
      // skills 用插槽自定义 Tag 展示
      {
        field: 'skills',
        label: '技能',
        span: 2,
        slots: {
          default: ({ data }) => (
            <ASpace size={4} wrap>
              {data.skills.map((s) => (
                <ATag color="blue" key={s}>
                  {s}
                </ATag>
              ))}
            </ASpace>
          ),
        },
      },
      // level 自定义 label + 自定义 Tag
      {
        field: 'level',
        label: '等级',
        slots: {
          label: () =>
            h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } }, [
              h(CrownOutlined, { style: { color: '#faad14' } }),
              '会员等级',
            ]),
          default: ({ data }) => (
            <ATag color={data.level === 'gold' ? 'gold' : 'default'}>
              {data.level === 'gold' ? '黄金会员' : '普通用户'}
            </ATag>
          ),
        },
      },
      { field: 'isActive', label: '激活状态', readonlyRender: activeRender },
      { field: 'address', label: '地址', span: 3 },
      { field: 'bio', label: '个人简介', span: 3 },
    ] as PDescriptionItemProps<UserData>[],
  }));

  // PForm 配置（编辑态）
  const formSetting = computed<PFormProps<UserData>>(() => ({
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    items: [
      {
        field: 'name',
        title: '姓名',
        span: 8,
        rule: [{ required: true, message: '请输入姓名' }],
        itemRender: { name: '$input', props: { placeholder: '请输入姓名' } },
      },
      {
        field: 'email',
        title: '邮箱',
        span: 8,
        rule: [{ type: 'email', message: '请输入正确的邮箱' }],
        itemRender: { name: '$input', props: { placeholder: '请输入邮箱' } },
      },
      {
        field: 'age',
        title: '年龄',
        span: 8,
        itemRender: { name: '$number', props: { min: 0, max: 150 } },
      },
      { field: 'gender', title: '性别', span: 8, itemRender: genderRender },
      { field: 'birthday', title: '生日', span: 8, itemRender: birthdayRender },
      { field: 'level', title: '会员等级', span: 8, itemRender: levelRender },
      { field: 'skills', title: '技能', span: 16, itemRender: skillsRender },
      { field: 'isActive', title: '激活状态', span: 8, itemRender: activeRender },
      {
        field: 'address',
        title: '地址',
        span: 24,
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
        itemRender: { name: '$input', props: { placeholder: '请输入地址' } },
      },
      {
        field: 'bio',
        title: '个人简介',
        span: 24,
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
        itemRender: { name: '$textarea', props: { rows: 3, placeholder: '请输入简介' } },
      },
    ] as PFormItemProps<UserData>[],
  }));
</script>

<template>
  <a-space direction="vertical" style="width: 100%" size="middle">
    <a-card title="演示开关" size="small">
      <a-space>
        <span>带边框：</span>
        <a-switch v-model:checked="bordered" />
        <span style="margin-left: 16px">布局：</span>
        <a-button
          :type="layout === 'horizontal' ? 'primary' : 'default'"
          size="small"
          @click="layout = 'horizontal'"
        >
          horizontal
        </a-button>
        <a-button
          :type="layout === 'vertical' ? 'primary' : 'default'"
          size="small"
          @click="layout = 'vertical'"
        >
          vertical
        </a-button>
      </a-space>
    </a-card>

    <a-card :title="isEditing ? '编辑用户信息' : '用户信息（只读）'" size="small">
      <template #extra>
        <a-space v-if="!isEditing">
          <a-button type="primary" @click="enterEdit">
            <template #icon><edit-outlined /></template>
            编辑
          </a-button>
        </a-space>
        <a-space v-else>
          <a-button type="primary" @click="saveEdit">保存</a-button>
          <a-button @click="cancelEdit">取消</a-button>
        </a-space>
      </template>

      <p-form v-if="isEditing" v-bind="formSetting" :data="editingData" />
      <p-description v-else v-bind="descSetting" />
    </a-card>

    <a-card title="说明" size="small">
      <ul style="margin: 0; padding-left: 20px; color: #555">
        <li>同一份数据，PDescription 与 PForm 切换：编辑前 clone 副本，取消即丢弃，保存才回写</li>
        <li
          >渲染器复用：<code>itemRender</code>（编辑）和
          <code>readonlyRender</code>（只读）共享同一个 <code>ItemRender</code> 配置对象</li
        >
        <li><code>renderReadonly</code> 内置 <code>disabled: true</code>，调用方无需手动加</li>
        <li><code>slots.default</code> 优先级最高（如 skills、level），可自定义任意 VNode</li>
        <li>空值（null/undefined/''）显示 <code>emptyText</code>，默认 '-'</li>
      </ul>
    </a-card>
  </a-space>
</template>
