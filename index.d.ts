import PForm from '@/components/PForm.vue';
import PGrid from '@/components/PGrid.vue';
import PFormGroup from '@/components/PFormGroup.vue';
import PGroupBlock from '@/components/PGroupBlock.vue';
import PromisePicker from '@/components/PromisePicker.vue';

declare module 'vue' {
  export interface GlobalComponents {
    PForm: typeof PForm;
    PGrid: typeof PGrid;
    PFormGroup: typeof PFormGroup;
    PGroupBlock: typeof PGroupBlock;
    PromisePicker: typeof PromisePicker;
  }
}
