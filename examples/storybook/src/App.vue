<script setup lang="tsx">
  import { ref, onMounted } from 'vue';
  import {
    Typography,
    Space as ASpace,
    Divider as ADivider,
    Button as AButton,
    Switch as ASwitch,
  } from 'ant-design-vue';
  import { theme } from 'ant-design-vue';
  // 导入示例组件
  import PGridExample from './view/PGridExample.vue';
  import PFormExample from './view/PFormExample.vue';
  import PFormGroupExample from './view/PFormGroupExample.vue';
  import PCanvasTableExample from './view/PCanvasTableExample.vue';
  import PCanvasGridExample from './view/PCanvasGridExample.vue';
  import PromisePickerExample from './view/PromisePickerExample.vue';
  import FamilyTreeExample from './view/FamilyTreeExample.vue';

  const { Title } = Typography;

  // 当前展示模式
  const currentView = ref<
    'grid' | 'form' | 'group' | 'canvasTable' | 'canvasGrid' | 'promisePicker' | 'familyTree'
  >('grid');

  // 主题切换
  const isDarkMode = ref(false);

  const toggleTheme = (checked: boolean) => {
    isDarkMode.value = checked;
    if (checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // 初始化时检查本地存储的主题
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkMode.value = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });

  // 监听主题变化并保存到本地存储
  const handleThemeChange = (checked: boolean) => {
    toggleTheme(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };
</script>

<template>
  <div class="w-full flex flex-col">
    <a-config-provider
      :theme="{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          // colorPrimary: '#fbd244',
          colorDanger: '#f5222d',
          colorSuccess: '#38b865',
          colorWarning: '#eb5e12',
        },
      }"
    >
    </a-config-provider>
    <div class="mb-4">
      <div class="flex justify-between items-center mb-4">
        <a-typography-title :level="2" style="margin-bottom: 0">
          Vue UI Kit 示例
        </a-typography-title>
        <div class="theme-switcher">
          <span style="margin-right: 8px">🌞 日间</span>
          <a-switch v-model:checked="isDarkMode" @change="handleThemeChange" />
          <span style="margin-left: 8px">🌙 夜间</span>
        </div>
      </div>
      <a-space>
        <a-button
          :type="currentView === 'grid' ? 'primary' : 'default'"
          @click="currentView = 'grid'"
        >
          PGrid 示例
        </a-button>
        <a-button
          :type="currentView === 'form' ? 'primary' : 'default'"
          @click="currentView = 'form'"
        >
          PForm 示例
        </a-button>
        <a-button
          :type="currentView === 'group' ? 'primary' : 'default'"
          @click="currentView = 'group'"
        >
          PFormGroup 示例
        </a-button>
        <a-button
          :type="currentView === 'canvasTable' ? 'primary' : 'default'"
          @click="currentView = 'canvasTable'"
        >
          PCanvasTable 示例
        </a-button>
        <a-button
          :type="currentView === 'canvasGrid' ? 'primary' : 'default'"
          @click="currentView = 'canvasGrid'"
        >
          PCanvasGrid 示例
        </a-button>
        <a-button
          :type="currentView === 'promisePicker' ? 'primary' : 'default'"
          @click="currentView = 'promisePicker'"
        >
          PromisePicker 示例
        </a-button>
        <a-button
          :type="currentView === 'familyTree' ? 'primary' : 'default'"
          @click="currentView = 'familyTree'"
        >
          族谱树示例
        </a-button>
      </a-space>
    </div>
    <a-divider />
    <div class="flex-1 h-0 overflow-y-auto">
      <!-- PGrid 示例 -->
      <div v-if="currentView === 'grid'">
        <p-grid-example />
      </div>

      <!-- PForm 示例 -->
      <div v-if="currentView === 'form'">
        <p-form-example />
      </div>

      <!-- PFormGroup 示例 -->
      <div v-if="currentView === 'group'">
        <p-form-group-example />
      </div>

      <!-- PCanvasTable 示例 -->
      <div v-if="currentView === 'canvasTable'">
        <p-canvas-table-example />
      </div>

      <!-- PCanvasGrid 示例 -->
      <div v-if="currentView === 'canvasGrid'">
        <p-canvas-grid-example />
      </div>

      <!-- PromisePicker 示例 -->
      <div v-if="currentView === 'promisePicker'">
        <promise-picker-example />
      </div>

      <!-- 族谱树示例 -->
      <div v-if="currentView === 'familyTree'">
        <family-tree-example />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .demo-container {
    margin: 20px 0;
  }

  .theme-switcher {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
