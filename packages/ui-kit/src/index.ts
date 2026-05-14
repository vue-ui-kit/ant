import { App } from 'vue';
import type { Component } from 'vue';
import PForm from '@/components/PForm.vue';
import PGrid from '@/components/PGrid.vue';
import PCanvasTable from '@/components/PCanvasTable.vue';
import PCanvasGrid from '@/components/PCanvasGrid.vue';
import PFormGroup from '@/components/PFormGroup.vue';
import PGroupBlock from '@/components/PGroupBlock.vue';
import PromisePicker from '@/components/PromisePicker.vue';
import PDescription from '@/components/PDescription.vue';
import { addFormatter } from '@/utils/AFormatters';
import { addRender } from '@/store/renderStore';
import {
  setUIKitConfig,
  getUIKitConfig,
  resetUIKitConfig,
  getTooltipRenderer,
  UIKitConfig,
} from '@/utils/config';

// 创建setup方法
function setup(config?: Partial<UIKitConfig>) {
  if (config) {
    setUIKitConfig(config);
  }
}

export default {
  install(app: App) {
    app.component('PForm', PForm);
    app.component('PGrid', PGrid);
    app.component('PCanvasTable', PCanvasTable);
    app.component('PCanvasGrid', PCanvasGrid);
    app.component('PFormGroup', PFormGroup as unknown as Component);
    app.component('PGroupBlock', PGroupBlock);
    app.component('PromisePicker', PromisePicker);
    app.component('PDescription', PDescription);
  },
  addFormatter,
  addRender,
  setup,
};

// 导出所有类型
export * from '#/antProxy';
export * from '@/utils/autoViewportBox';
export * from '@/utils/core';

// 导出配置方法
export {
  setup,
  setUIKitConfig,
  getUIKitConfig,
  resetUIKitConfig,
  getTooltipRenderer,
  type UIKitConfig,
};

// 直接导出组件，使用户可以直接导入使用
export {
  PForm,
  PGrid,
  PCanvasTable,
  PCanvasGrid,
  PFormGroup,
  PGroupBlock,
  PromisePicker,
  PDescription,
  addFormatter,
  addRender,
};
