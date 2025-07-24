import { App } from 'vue';
import PForm from '@/components/PForm.vue';
import PGrid from '@/components/PGrid.vue';
import PCanvasGrid from '@/components/PCanvasGrid.vue';
import PFormGroup from '@/components/PFormGroup.vue';
import PGroupBlock from '@/components/PGroupBlock.vue';
import PromisePicker from '@/components/PromisePicker.vue';
import { addFormatter } from '@/utils/AFormatters';
import { addRender } from '@/store/renderStore';
import { setUIKitConfig, getUIKitConfig, resetUIKitConfig, UIKitConfig } from '@/utils/config';

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
    app.component('PCanvasGrid', PCanvasGrid);
    // @ts-ignore
    app.component('PFormGroup', PFormGroup);
    app.component('PGroupBlock', PGroupBlock);
    app.component('PromisePicker', PromisePicker);
  },
  addFormatter,
  addRender,
  setup,
};

// 导出所有类型
export * from '#/antProxy';
export * from '@/utils/core';

// 导出配置方法
export { setup, setUIKitConfig, getUIKitConfig, resetUIKitConfig, type UIKitConfig };

// 直接导出组件，使用户可以直接导入使用
export {
  PForm,
  PGrid,
  PCanvasGrid,
  PFormGroup,
  PGroupBlock,
  PromisePicker,
  addFormatter,
  addRender,
};
