import { defineComponent, toRefs } from 'vue';
import { PFormItemProps } from '#/antProxy';

export default defineComponent(
  <F = Recordable,>(props: { formData: F; item: PFormItemProps<F> }) => {
    const { formData } = toRefs(props);
    return () => {
      return props.item.slots?.default?.({ data: formData.value, field: props.item.field }) ?? null;
    };
  },
  {
    name: 'RenderItemSlots',
    props: ['formData', 'item'],
  },
);
