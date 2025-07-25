import { isArray, isFunction, isString, toNumber } from 'xe-utils';
import { valued } from '@/utils/is';
import { CellFuncArg, ColumnProps, PFormatter } from '#/antProxy';

const emptyStr = `-`;
export const antFormatters: PFormatter = {
  toString: ({ cellValue }) => (cellValue ? (cellValue.toString?.() ?? emptyStr) : emptyStr),
  // 格式化选项
  formatByOptions: ({ cellValue }, options: IOption[], separator = ',') => {
    if (cellValue === undefined || cellValue === null) {
      return emptyStr;
    }
    // 多选时逗号分隔
    if (isArray(cellValue)) {
      if (cellValue.length > 0) {
        const finder = options.filter((item) => cellValue.includes(item.value));
        return finder.length ? finder.map((item) => item.label).join(separator) : emptyStr;
      } else {
        return emptyStr;
      }
    }
    // 单选时
    const finder = options.find((item) => item.value === cellValue);
    return finder ? finder.label : emptyStr;
  },
  // 格式化性别
  formatSex: ({ cellValue }) => {
    return valued(cellValue) ? (toNumber(cellValue) === 1 ? '男' : '女') : emptyStr;
  },
};
export const renderAntFormat = <D extends Recordable = Recordable>(
  formatter: string | [string, ...Array<any>] | ((arg: CellFuncArg<D>) => any),
  {
    record,
    index,
    column,
    field,
  }: { record: D; index: number; field?: string; column: ColumnProps<D> },
) => {
  if (isString(formatter) && antFormatters[formatter]) {
    const func = antFormatters[formatter];
    return func({ row: record, rowIndex: index, cellValue: field ? record[field] : null });
  } else if (isArray(formatter) && antFormatters[formatter[0]] && formatter.length > 1) {
    const func = antFormatters[formatter[0]];
    return func(
      { row: record, rowIndex: index, cellValue: field ? record[field] : null },
      ...formatter.slice(1),
    );
  } else if (isFunction(formatter)) {
    return formatter({
      row: record,
      rowIndex: index,
      cellValue: field ? record[field] : null,
      column,
    });
  } else {
    return field ? record[field] : null;
  }
};
export const addFormatter = (
  formatter: Record<string, (a: CellFuncArg, ...args: any[]) => any>,
) => {
  Object.assign(antFormatters, formatter);
};
