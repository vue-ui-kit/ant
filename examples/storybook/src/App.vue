<script setup lang="tsx">
  import { ref } from 'vue';
  import {
    Typography,
    Space as ASpace,
    Divider as ADivider,
    Button as AButton,
  } from 'ant-design-vue';

  // 导入示例组件
  import PGridExample from './view/PGridExample.vue';
  import PFormExample from './view/PFormExample.vue';
  import PFormGroupExample from './view/PFormGroupExample.vue';
  import PCanvasTableExample from './view/PCanvasTableExample.vue';
  import PromisePickerExample from './view/PromisePickerExample.vue';

  const { Title } = Typography;

  // 当前展示模式
  const currentView = ref<'grid' | 'form' | 'group' | 'canvasTable' | 'promisePicker'>('grid');
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="mb-4">
      <a-typography-title :level="2">Vue UI Kit 示例</a-typography-title>
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
          :type="currentView === 'promisePicker' ? 'primary' : 'default'"
          @click="currentView = 'promisePicker'"
        >
          PromisePicker 示例
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

      <!-- PromisePicker 示例 -->
      <div v-if="currentView === 'promisePicker'">
        <promise-picker-example />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .demo-container {
    margin: 20px 0;
  }
</style>
