<script setup lang="tsx">
  import { ref } from 'vue';
  import { Student } from '../Mock/apis/type';
  import { CanvasColumnProps, PCanvasTableInstance } from '@vue-ui-kit/ant';
  import {
    Button as AButton,
    Space as ASpace,
    RadioGroup as ARadioGroup,
    RadioButton as ARadioButton,
  } from 'ant-design-vue';
  import { sample } from 'xe-utils';

  const canvasTableInstance = ref<PCanvasTableInstance<Student>>();

  const bigData = ref<Student[]>(
    Array.from({ length: 10000 }, (_, i) => ({
      name: `学生${i}`,
      enName: `Student${i}`,
      id: i,
      score: Math.floor(Math.random() * 100),
      age: Math.floor(Math.random() * 5) + 10,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      class: `class${i}`,
      address: `address${i}`,
      phone: `phone${i}`,
      email: `email${i}@qq.com`,
      birthDate: `birthDate${i}`,
      createTime: `createTime${i}`,
      hobby: sample(
        [
          'reading',
          'swimming',
          'coding',
          'running',
          'dancing',
          'singing',
          'painting',
          'writing',
          'reading',
          'swimming',
          'coding',
          'running',
          'dancing',
          'singing',
          'painting',
          'writing',
          'reading',
          'swimming',
          'coding',
          'running',
          'dancing',
          'singing',
          'painting',
          'writing',
          'reading',
          'swimming',
        ],
        Math.floor(Math.random() * 6),
      ),
      grade: `grade${Math.floor(Math.random() * 6)}`,
      isStudent: Math.random() > 0.5,
      isTeacher: Math.random() > 0.5,
      isAdmin: Math.random() > 0.5,
      isSuperAdmin: Math.random() > 0.5,
    })),
  );

  const footerData: Record<string, string>[] = [
    {
      name: '总人数',
      enName: '10000',
    },
    {
      name: '平均分',
      score: '50',
    },
  ];

  const canvasTableColumns: CanvasColumnProps<Student>[] = [
    {
      field: '#',
      title: '',
      width: 80,
      type: 'selection',
      fixed: 'left',
    },
    {
      field: 'id',
      title: 'ID',
      width: 180,
    },
    {
      field: 'name',
      title: '姓名',
      minWidth: 300,
      render: 'capitalize',
    },
    {
      field: 'enName',
      title: '英文名',
      width: 300,
      render: 'capitalize',
      editRender: {
        name: '$input',
      },
    },
    {
      field: 'age',
      title: '年龄',
      width: 200,
      editRender: {
        name: '$number',
        props: {
          min: 10,
          max: 120,
          placeholder: '请输入年龄(10-120)',
        },
      },
    },
    {
      field: 'gender',
      title: '性别',
      editRender: {
        name: '$select',
        props: {
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
        },
      },
      width: 200,
    },
    {
      field: 'class',
      title: '班级',
      width: 200,
    },
    {
      field: 'hobby',
      title: '爱好',
      width: 200,
      slots: {
        default: ({ row, column, rowIndex }) => (
          <div
            style={{
              display: 'flex',
              height: '100%',
              padding: '4px',
              flexWrap: 'wrap',
              gap: '4px',
              alignItems: 'center',
            }}
          >
            {(row.hobby ?? []).map((o, index) => (
              <a-tag color="blue" key={index}>
                {o}
              </a-tag>
            ))}
          </div>
        ),
      },
    },
    {
      field: 'address',
      title: '地址',
      width: 200,
    },
    {
      field: 'phone',
      title: '电话',
      width: 200,
    },
    {
      field: 'email',
      title: '邮箱',
      slots: {
        edit: ({ row }) => {
          return (
            <a-space-compact>
              <a-input
                bordered={false}
                value={row.email?.substring(0, row.email?.indexOf('@'))}
                onBlur={(e: any) => {
                  row.email =
                    e.target.value + '@' + row.email?.substring(row.email?.indexOf('@') + 1);
                }}
                suffix="@"
              />
              <a-input
                bordered={false}
                value={row.email?.substring(row.email?.indexOf('@') + 1)}
                onBlur={(e: any) => {
                  row.email =
                    row.email?.substring(0, row.email?.indexOf('@')) + '@' + e.target.value;
                }}
              />
            </a-space-compact>
          );
        },
      },
      width: 200,
    },
    {
      field: 'birthDate',
      title: '生日',
      width: 200,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 200,
    },

    {
      field: 'score',
      title: '分数',
      width: 200,
      cellRender: {
        name: 'colorFullScore',
      },
      fixed: 'right',
      renderFooter: ({ row }: { row: Student }) => (
        <div>
          <span style={{ color: 'red', fontWeight: 'bold' }}>{row.score}</span>
        </div>
      ),
    },
  ];

  const handleCanvasToolbarBtn = ({ code, records }: { code: string; records: Student[] }) => {
    switch (code) {
      case 'add':
        console.log('新增操作');
        break;
      case 'edit':
        if (records.length === 0) {
          console.warn('请选择要编辑的记录');
          return;
        }
        console.log('编辑操作:', records);
        break;
      case 'delete':
        if (records.length === 0) {
          console.warn('请选择要删除的记录');
          return;
        }
        console.log('删除操作:', records);
        break;
    }
  };

  const handleCanvasToolClick = ({ code }: { code: string }) => {
    switch (code) {
      case 'export':
        console.log('导出操作');
        break;
      case 'refresh':
        console.log('刷新操作');
        break;
    }
  };

  const getSelectedRows = () => {
    console.log('已选项:', canvasTableInstance.value?.selectedRecords);
  };

  const canvasTableConfig = ref({
    DISABLED: true,
    HEIGHT: 500,
  });
</script>

<template>
  <div>
    <a-typography-title :level="3">PCanvasGrid - Canvas虚拟表格</a-typography-title>
    <p>基于e-virt-table的高性能虚拟滚动表格组件，支持大数据量渲染</p>
    <a-space>
      <span>编辑状态：</span>
      <a-radio-group v-model:value="canvasTableConfig.DISABLED">
        <a-radio-button :value="true">禁用</a-radio-button>
        <a-radio-button :value="false">启用</a-radio-button>
      </a-radio-group>

      <a-button @click="getSelectedRows">输出已选项</a-button>
    </a-space>
    <div style="height: 600px; margin-top: 16px">
      <p-canvas-table
        ref="canvasTableInstance"
        :data="bigData"
        :columns="canvasTableColumns"
        :config="canvasTableConfig"
        :footer-data="footerData"
      />
    </div>
  </div>
</template>
