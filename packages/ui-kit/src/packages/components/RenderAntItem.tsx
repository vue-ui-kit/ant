import { defineComponent, PropType, toRefs } from 'vue';
import { ItemRender, RenderFormParams } from '#/antProxy';
import renderStore from '@/store/renderStore';

export default defineComponent(
  <F = Recordable,>(
    props: {
      itemRender: ItemRender;
      renderFormParams: RenderFormParams<F>;
      defaultHandler?: {
        [key: string]: (...args: any[]) => any;
      };
    },
    { emit },
  ) => {
    const { itemRender, defaultHandler } = props;
    const { renderFormParams } = toRefs(props);
    const passTrigger = (cusFields?: string | string[]) => {
      emit('trigger', cusFields);
    };
    const passDelayTrigger = (cusFields?: string | string[], time?: number) => {
      emit('delayTrigger', cusFields, time);
    };
    return () => {
      return (
        renderStore.renders[itemRender!.name]?.renderItemContent?.(
          {
            ...itemRender!,
            handleTrigger: passTrigger,
            handleDelayTrigger: passDelayTrigger,
          },
          renderFormParams.value,
          defaultHandler,
        ) ?? null
      );
    };
  },
  {
    name: 'RenderAntItem',
    props: {
      itemRender: {
        type: Object as PropType<ItemRender>,
        required: true,
      },
      renderFormParams: {
        type: Object as PropType<RenderFormParams>,
        required: true,
      },
      defaultHandler: {
        type: Object as PropType<{
          [key: string]: (...args: any[]) => any;
        }>,
        required: false,
      },
    },
    emits: ['trigger', 'delayTrigger'],
  },
);
