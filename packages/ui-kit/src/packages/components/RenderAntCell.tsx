import { defineComponent } from 'vue';
import { CellRender, RenderTableParams } from '#/antProxy';
import renderStore from '@/store/renderStore';

export default defineComponent(
  <D = Recordable,>(props: {
    cellRender: CellRender;
    renderTableParams: RenderTableParams<D>;
    defaultHandler?: {
      [key: string]: (...args: any[]) => any;
    };
  }) => {
    const { cellRender, renderTableParams } = props;
    const { data, row, field, rowIndex } = renderTableParams!;
    return () => {
      return (
        renderStore.renders[cellRender!.name]?.renderDefault?.(
          cellRender!,
          { data, row, field, rowIndex },
          props.defaultHandler,
        ) ?? null
      );
    };
  },
  {
    name: 'RenderAntCell',
    props: ['cellRender', 'renderTableParams', 'defaultHandler'],
  },
);
