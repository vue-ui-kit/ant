import { ColumnProps, Responsive } from '#/antProxy';
import { TableColumnGroupType, TableColumnType } from 'ant-design-vue';
import { clone, isArray, isNumber, omit, zipObject } from 'xe-utils';
import { valued } from '@/utils/is';
import { toValue, watch, WatchCallback, WatchOptions, WatchSource } from 'vue';

export const cleanCol = (col: ColumnProps): TableColumnType | TableColumnGroupType<Recordable> => {
  return {
    dataIndex: col.field,
    key: col.field,
    title: col.title,
    ...omit(col, ['children', 'slots', 'cellRender', 'formatter']),
    children: col.children?.map((subCol) => cleanCol(subCol)),
  };
};

export const defaultItemResponsive: Responsive = { xs: 24, sm: 24, md: 12, lg: 8, xl: 8, xxl: 6 };
export const defaultLabelCol: Responsive = { xs: 12, sm: 5, md: 6, lg: 6, xl: 5, xxl: 4 }; //defaultItemResponsive对应的labelCol 大概4字
export const labelColDict: Record<number, Responsive> = {
  1: { xs: 12, sm: 5, md: 6, lg: 6, xl: 5, xxl: 4 },
  2: { xs: 12, sm: 5, md: 6, lg: 6, xl: 5, xxl: 4 },
  3: { xs: 12, sm: 5, md: 6, lg: 6, xl: 5, xxl: 5 },
  4: { xs: 12, sm: 4, md: 6, lg: 9, xl: 7, xxl: 6 },
  5: { xs: 12, sm: 4, md: 6, lg: 9, xl: 7, xxl: 6 },
  6: { xs: 12, sm: 6, md: 8, lg: 10, xl: 7, xxl: 8 },
  7: { xs: 12, sm: 6, md: 8, lg: 10, xl: 9, xxl: 9 },
  8: { xs: 12, sm: 6, md: 8, lg: 10, xl: 7, xxl: 9 },
  9: { xs: 12, sm: 6, md: 8, lg: 10, xl: 9, xxl: 10 },
};
export const get24rest = (exist: number[]) => {
  /*24为一行，获取最后一行余数，为0则是24*/
  const total = exist.reduce((prev, cur) => prev + cur, 0);
  const rest = (24 - total) % 24;
  const firstRest = rest === 0 ? 24 : rest < 0 ? 24 + rest : rest;
  /*当其依然为1时使其为24*/
  return firstRest > 1 ? firstRest : 24;
};
const resKeys = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
export const getButtonResponsive = (itemResponsive: number | Responsive[]) => {
  const existResponsive: Responsive[] = isArray(itemResponsive)
    ? itemResponsive
    : isNumber(itemResponsive)
      ? Array.from({ length: itemResponsive }, () => defaultItemResponsive)
      : [];
  return zipObject(
    resKeys,
    resKeys.map((key) =>
      existResponsive.every((e) => valued(e[key]))
        ? get24rest(existResponsive.map((e) => e[key]!))
        : 24,
    ),
  );
};

export function watchPreviousDeep<T extends object>(
  source: WatchSource<T>,
  cb: (value: T, oldValue: T, onCleanup: () => void) => void,
  options?: WatchOptions,
) {
  const val = toValue(source);
  if (typeof val !== 'object' || val === null) {
    return watch(source, cb as WatchCallback<T>, options);
  }
  let previousValue = clone(val, true) as T;
  return watch(
    source,
    (crtValue, _, onCleanup) => {
      cb(crtValue as T, previousValue, onCleanup as () => void);
      previousValue = clone(crtValue, true) as T;
    },
    options,
  );
}
