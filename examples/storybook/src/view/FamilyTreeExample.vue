<script setup lang="tsx">
  import { computed, ref } from 'vue';
  import { FamilyMember } from '../Mock/apis/family';
  import {
    queryFamilyMembers,
    getFamilyTree,
    getFamilyMemberById,
    getFamilyMembersByGeneration,
    getLivingMembers,
  } from '../Mock/apis/family';
  import {
    Card as ACard,
    Button as AButton,
    Space as ASpace,
    Tag as ATag,
    Avatar as AAvatar,
    Descriptions as ADescriptions,
    message,
  } from 'ant-design-vue';
  import { UserOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons-vue';

  const familyTreeData = ref<FamilyMember[]>([]);
  const selectedMember = ref<FamilyMember | null>(null);
  const currentView = ref<'tree' | 'detail'>('tree');

  // 加载族谱树形数据
  const loadFamilyTree = async () => {
    try {
      const data = await getFamilyTree();
      familyTreeData.value = data;
      message.success('族谱数据加载成功');
    } catch (error) {
      message.error('族谱数据加载失败');
    }
  };

  // 族谱成员列表配置
  const familyColumns = [
    {
      width: 10,
      type: 'selection',
    },
    {
      field: 'name',
      width: 200,
      title: '姓名',
      type: 'tree',
    },
    {
      field: 'gender',
      width: 100,
      title: '性别',
      slots: {
        default: ({ row }: { row: FamilyMember }) => (
          <span style={{ color: row.gender === 'male' ? '#1890ff' : '#eb2f96' }}>
            {row.gender === 'male' ? '男' : '女'}
          </span>
        ),
      },
    },
    {
      field: 'generation',
      width: 100,
      title: '代数',
      slots: {
        default: ({ row }: { row: FamilyMember }) => (
          <a-tag color="blue">第{row.generation}代</a-tag>
        ),
      },
    },
    {
      field: 'age',
      width: 100,
      title: '年龄',
    },
    {
      field: 'occupation',
      width: 150,
      title: '职业',
    },
    {
      field: 'isAlive',
      width: 100,
      title: '状态',
      slots: {
        default: ({ row }: { row: FamilyMember }) => (
          <span>
            {row.isAlive ? (
              <a-tag color="green" icon={<HeartFilled />}>
                在世
              </a-tag>
            ) : (
              <a-tag color="red" icon={<HeartOutlined />}>
                已故
              </a-tag>
            )}
          </span>
        ),
      },
    },
    {
      field: 'address',
      width: 200,
      title: '地址',
    },
    {
      field: 'tags',
      width: 200,
      title: '标签',
      slots: {
        default: ({ row }: { row: FamilyMember }) => (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {row.tags.map((tag: string, index: number) => (
              <a-tag key={index} color="blue">
                {tag}
              </a-tag>
            ))}
          </div>
        ),
      },
    },
  ];

  // 工具栏按钮事件处理
  const handleToolbarBtn = async ({ code, records }: { code: string; records: FamilyMember[] }) => {
    switch (code) {
      case 'viewTree':
        await loadFamilyTree();
        currentView.value = 'tree';
        break;
      case 'viewLiving':
        try {
          const livingMembers = await getLivingMembers();
          message.success(`在世成员：${livingMembers.total}人`);
          console.log('在世成员:', livingMembers.list);
        } catch (error) {
          message.error('获取在世成员失败');
        }
        break;
      case 'viewDetail':
        if (records.length === 1) {
          try {
            const member = await getFamilyMemberById(records[0].id);
            if (member) {
              selectedMember.value = member;
              currentView.value = 'detail';
            } else {
              message.error('获取成员详情失败');
            }
          } catch (error) {
            message.error('获取成员详情失败');
          }
        } else {
          message.warning('请选择一个成员查看详情');
        }
        break;
    }
  };

  // 初始化加载数据
  loadFamilyTree();
</script>

<template>
  <div>
    <a-typography-title :level="3">族谱树形数据示例</a-typography-title>
    <p>使用PCanvasTable渲染族谱的树形数据结构，第一列type为tree</p>

    <a-space style="margin-bottom: 16px">
      <a-button
        :type="currentView === 'tree' ? 'primary' : 'default'"
        @click="currentView = 'tree'"
      >
        族谱树
      </a-button>
      <a-button
        :type="currentView === 'detail' ? 'primary' : 'default'"
        @click="currentView = 'detail'"
        :disabled="!selectedMember"
      >
        成员详情
      </a-button>
    </a-space>

    <!-- 族谱树视图 -->
    <div v-if="currentView === 'tree'">
      <a-card title="族谱树形结构" style="margin-top: 16px">
        <div style="height: 600px">
          <p-canvas-table
            :columns="familyColumns"
            :data="familyTreeData"
            :config="{ HEIGHT: 500 }"
            @toolbar-button-click="handleToolbarBtn"
          />
        </div>
      </a-card>
    </div>

    <!-- 成员详情视图 -->
    <div v-if="currentView === 'detail' && selectedMember">
      <a-card title="成员详情" style="margin-top: 16px">
        <div style="display: flex; gap: 16px">
          <a-avatar :size="80" :src="selectedMember.avatar" :icon="UserOutlined" />
          <div style="flex: 1">
            <a-descriptions title="基本信息" :column="2">
              <a-descriptions-item label="姓名">
                {{ selectedMember.name }}
              </a-descriptions-item>
              <a-descriptions-item label="性别">
                <a-tag :color="selectedMember.gender === 'male' ? 'blue' : 'pink'">
                  {{ selectedMember.gender === 'male' ? '男' : '女' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="代数">
                <a-tag color="blue">第{{ selectedMember.generation }}代</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="年龄"> {{ selectedMember.age }}岁 </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag :color="selectedMember.isAlive ? 'green' : 'red'">
                  {{ selectedMember.isAlive ? '在世' : '已故' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="职业">
                {{ selectedMember.occupation || '未知' }}
              </a-descriptions-item>
              <a-descriptions-item label="教育">
                {{ selectedMember.education || '未知' }}
              </a-descriptions-item>
              <a-descriptions-item label="地址">
                {{ selectedMember.address || '未知' }}
              </a-descriptions-item>
              <a-descriptions-item label="出生日期">
                {{ selectedMember.birthDate }}
              </a-descriptions-item>
              <a-descriptions-item label="逝世日期" v-if="selectedMember.deathDate">
                {{ selectedMember.deathDate }}
              </a-descriptions-item>
              <a-descriptions-item label="电话" v-if="selectedMember.phone">
                {{ selectedMember.phone }}
              </a-descriptions-item>
              <a-descriptions-item label="邮箱" v-if="selectedMember.email">
                {{ selectedMember.email }}
              </a-descriptions-item>
            </a-descriptions>

            <a-descriptions title="标签" style="margin-top: 16px">
              <a-descriptions-item>
                <a-space>
                  <a-tag v-for="tag in selectedMember.tags" :key="tag" color="blue">
                    {{ tag }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>
            </a-descriptions>

            <a-descriptions title="描述" style="margin-top: 16px">
              <a-descriptions-item>
                {{ selectedMember.description || '暂无描述' }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>
