import { defineComponent } from 'vue';
import { ColumnProps } from '#/antProxy';

export default defineComponent(
  <D extends Recordable = Recordable>(props: { column: ColumnProps<D> }) => {
    const { column } = props;
    return () => {
      return column.slots?.title?.({ column }) ?? column.title;
    };
  },
  {
    name: 'RenderAntTitle',
    props: ['column'],
  },
);
