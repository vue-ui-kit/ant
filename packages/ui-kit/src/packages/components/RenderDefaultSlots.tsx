import { defineComponent } from 'vue';
import { ColumnProps } from '#/antProxy';
import { renderAntFormat } from '@/utils/AFormatters';
import RenderAntCell from '@/components/RenderAntCell';

export default defineComponent(
  <D extends Recordable = Recordable>(props: {
    tableData: D[];
    row: D;
    column: ColumnProps<D>;
    rowIndex: number;
    defaultHandler?: {
      [key: string]: (...args: any[]) => any;
    };
  }) => {
    const { tableData, row, column, rowIndex } = props;
    const cellValue = column.field ? row[column.field] : null;
    return () => {
      return (
        column.slots?.default?.({ row, column, rowIndex, cellValue }) ??
        (column.cellRender ? (
          <RenderAntCell
            cellRender={column.cellRender}
            defaultHandler={props.defaultHandler}
            renderTableParams={{ data: tableData, row, field: column.field, rowIndex }}
          />
        ) : column.formatter ? (
          renderAntFormat(column.formatter, {
            record: row,
            index: rowIndex,
            field: column.field,
            column,
          })
        ) : (
          cellValue
        ))
      );
    };
  },
  {
    name: 'RenderAntDefaultCell',
    props: ['tableData', 'row', 'column', 'rowIndex', 'defaultHandler'],
  },
);
