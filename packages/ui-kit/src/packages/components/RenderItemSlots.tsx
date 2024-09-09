import { defineComponent, toRefs } from 'vue';
import { PFormItemProps } from '#/antProxy';

export default defineComponent(
  <F = Recordable,>(props: {
    formData: F;
    item: PFormItemProps<F>;
    passTrigger: (cusFields?: string | string[]) => void;
  }) => {
    const { formData } = toRefs(props);
    return () => {
      return (
        props.item.slots?.default?.(
          { data: formData.value, field: props.item.field },
          props.passTrigger,
        ) ?? null
      );
    };
  },
  {
    name: 'RenderItemSlots',
    props: ['formData', 'item', 'passTrigger'],
  },
);
