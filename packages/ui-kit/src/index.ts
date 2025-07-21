import { App } from 'vue';
import PForm from '@/components/PForm.vue';
import PGrid from '@/components/PGrid.vue';
import PFormGroup from '@/components/PFormGroup.vue';
import PGroupBlock from '@/components/PGroupBlock.vue';
import PromisePicker from '@/components/PromisePicker.vue';
import { addFormatter } from '@/utils/AFormatters';
import { addRender } from '@/store/renderStore';
import { setUIKitConfig, getUIKitConfig, resetUIKitConfig, UIKitConfig } from '@/utils/config';
import * as utils from '@/utils/core';

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
    // @ts-ignore
    app.component('PFormGroup', PFormGroup);
    app.component('PGroupBlock', PGroupBlock);
    app.component('PromisePicker', PromisePicker);
  },
  addFormatter,
  addRender,
  setup,
};

export * from '#/antProxy';
export * from '@/utils/core';
export { 
  setup, 
  setUIKitConfig, 
  getUIKitConfig, 
  resetUIKitConfig,
  type UIKitConfig 
};
