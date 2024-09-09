import { App } from 'vue';
import PForm from '@/components/PForm.vue';
import PGrid from '@/components/PGrid.vue';
import PFormGroup from '@/components/PFormGroup.vue';
import PGroupBlock from '@/components/PGroupBlock.vue';
import PromisePicker from '@/components/PromisePicker.vue';
import { addFormatter } from '@/utils/AFormatters';
import { addRender } from '@/store/renderStore';

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
};

export * from '#/antProxy';
