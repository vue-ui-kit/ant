import { defineComponent } from 'vue';
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
    const { data, row, field, rowIndex } = renderTableParams!;
    return () => {
      return (
        renderStore.renders[cellRender!.name]?.renderEdit?.(
          cellRender!,
          { data, row, field, rowIndex },
          emit,
        ) ?? null
      );
    };
  },
  {
    name: 'RenderEditCell',
    props: ['cellRender', 'renderTableParams'],
    emits: ['blur'],
  },
);
