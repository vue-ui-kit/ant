import { defineComponent } from 'vue';
import type { ColumnProps } from '#/antProxy';
import { renderAntFormat } from '@/utils/AFormatters';
import RenderAntCell from '@/components/RenderAntCell';

export default defineComponent(
  <D extends Recordable = Recordable>(props: {
    tableData: D[];
    row: D;
    /**
     * `PGrid` / `columns` 仍为 `ColumnProps<D>[]`；此处不能写 `ColumnProps<D>`：
     * 模板里 `a-table` 的 `record` 无泛型上下文，会被推断为 `Record<string, any>`，与 `formatter` 里 `row: D` 逆变冲突（TS2322）。
     */
    column: ColumnProps<any>;
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
