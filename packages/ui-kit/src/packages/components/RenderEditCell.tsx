import { defineComponent, ref } from 'vue';
import { CellRender, RenderTableParams } from '#/antProxy';
import renderStore from '@/store/renderStore';

export default defineComponent(
  <D extends Recordable = Recordable>(
    props: {
      cellRender: CellRender;
      renderTableParams: RenderTableParams<D>;
    },
    { emit },
  ) => {
    const { cellRender, renderTableParams } = props;
    const { row, field } = renderTableParams!;
    if (field) {
      const innerValue = ref(row[field]);
      return () => {
        return (
          renderStore.renders[cellRender!.name]?.renderEdit?.(
            innerValue,
            cellRender!,
            renderTableParams,
            emit,
          ) ?? null
        );
      };
    } else {
      return () => null;
    }
  },
  {
    name: 'RenderEditCell',
    props: ['cellRender', 'renderTableParams'],
    emits: ['blur'],
  },
);
