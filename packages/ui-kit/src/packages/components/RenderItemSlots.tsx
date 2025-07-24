import { defineComponent, toRefs } from 'vue';
import { PFormItemProps } from '#/antProxy';

export default defineComponent(
  <F extends Recordable = Recordable>(props: {
    formData: F;
    item: PFormItemProps<F>;
    passTrigger: (cusFields?: string | string[]) => void;
    passDelayTrigger: (cusFields?: string | string[], time?: number) => void;
  }) => {
    const { formData } = toRefs(props);
    return () => {
      return (
        props.item.slots?.default?.(
          { data: formData.value, field: props.item.field },
          props.passTrigger,
          props.passDelayTrigger,
        ) ?? null
      );
    };
  },
  {
    name: 'RenderItemSlots',
    props: ['formData', 'item', 'passTrigger', 'passDelayTrigger'],
  },
);
