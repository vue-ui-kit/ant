import { defineComponent } from 'vue';
import type { PDescriptionItemProps } from '#/antProxy';
import renderStore from '@/store/renderStore';
import { isGoodValue } from '@/utils/is';

export default defineComponent(
  <D extends Recordable = Recordable>(props: {
    item: PDescriptionItemProps<D>;
    data: D;
    emptyText: string;
  }) => {
    return () => {
      const { item, data, emptyText } = props;

      // 1. 插槽优先
      if (item.slots?.default) {
        return item.slots.default({ data, field: item.field });
      }

      // 2. readonlyRender 派发到 renderReadonly（专为只读语境设计的渲染维度）
      if (item.readonlyRender?.name) {
        const r = item.readonlyRender;
        const node =
          renderStore.renders[r.name]?.renderReadonly?.(
            r,
            {
              data,
              field: item.field,
              title: item.label,
            },
            {},
          ) ?? null;
        if (node !== null) return node;
      }

      // 3. 原值；空值用 emptyText
      if (!item.field) return emptyText;
      const v = (data as Recordable)?.[item.field];
      return isGoodValue(v) ? v : emptyText;
    };
  },
  {
    name: 'PDescriptionContent',
    props: ['item', 'data', 'emptyText'],
  },
);
