import type { Rule } from 'ant-design-vue/lib/form';
import { ButtonProps } from 'ant-design-vue/lib/button';
import { ColProps } from 'ant-design-vue/lib/grid/Col';
import { FormProps } from 'ant-design-vue/lib/form/Form';
import { TableColumnType, TableProps, TooltipProps } from 'ant-design-vue';
import { ButtonType } from 'ant-design-vue/lib/button/buttonTypes';
import { ComputedRef } from 'vue';

export interface CellFuncArg<D = Recordable> {
  row: D;
  column: ColumnProps<D>;
  rowIndex: number;
  cellValue: any;
}

export interface ItemFuncArg<F = Recordable> {
  data: F;
  field?: string;
}

export interface ItemRender {
  name: string;
  defaultValue?: any;
  props?: Recordable;
  attrs?: Recordable;
  options?: IOption[];
  children?: Recordable[];
  events?: { [key: string]: (...args: any[]) => any };
}

export interface CellRender {
  name: string;
  props?: Recordable;
  attrs?: Recordable;
  children?: Recordable[];
}

export interface Responsive {
  xxs?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

export interface TooltipConfig extends TooltipProps {
  title: TooltipProps['title'] | (() => any);
}

export interface PFormItemProps<F = Recordable> {
  field?: string;
  title?: string;
  span?: number;
  colon?: boolean;
  labelCol?: ColProps
  wrapperCol?: ColProps
  forceRequired?: boolean; // 在页面需要必填标示，但field不需要必填校验时使用
  align?: 'left' | 'right' | 'center';
  col?: ColProps;
  rule?: Rule[];
  itemRender?: ItemRender;
  tooltipConfig?: TooltipConfig;
  slots?: {
    title?: () => any;
    default?: (
      { data, field }: ItemFuncArg<F>,
      passTrigger?: (cusFields?: string | string[]) => void,
      passDelayTrigger?: (cusFields?: string | string[], time?: number) => void
    ) => any;
    defaultValue?: any
  };
}

export interface PFormProps<F = Recordable> extends FormProps {
  items: PFormItemProps<F>[];
  customReset?: () => void;
}

export interface PBlockProps<F = Recordable> {
  getFormSetting: (data: Partial<F>) => PFormProps<Partial<F>>;
  source: Partial<F>;
}

export interface PromisePickerProps<D = Recordable, F = Recordable> {
  gridSetting: PGridProps<D, F>;
  title?: string;
  width?: string | number;
}

export type GroupMenuItemHandler<F = Recordable> = ({
  index,
  data,
  code,
}: {
  index: number;
  code: string;
  data: Partial<F & { __index: number }>;
}) => void;

export interface GroupMenuItem<F = Recordable> {
  content: string;
  icon?: string;
  code: string;
  visibleMethod?: ({ data, index }: { data: Partial<F>; index: number }) => boolean;
}

export interface PFormGroupProps<F = Recordable> {
  getFormSetting: (data: Partial<F>) => PFormProps<Partial<F>>;
  title?: string;
  tabLabel?: string;
  editAble?: boolean;
  showAdd?: boolean;
  lazyErrorMark?: boolean;
  forceRender?: boolean;
  /* 是否保持连续编号 */
  keepSerial?: boolean;
  loading?: boolean;
  itemMenus?: Array<GroupMenuItem<F>>;
  createItem?: ({ list }: { list?: Partial<F>[] }) => Promise<Partial<F>>;
  max?: number;
  menuHandler?: GroupMenuItemHandler<F>;
}

export interface ColumnProps<D = Recordable> extends Omit<TableColumnType, 'slots'> {
  field?: string;
  children?: ColumnProps<D>[];
  formatter?:
    | string
    | [string, ...Array<any>]
    | ((arg: PartialByKeys<CellFuncArg<D>, 'cellValue'>) => any);
  slots?: {
    default?: ({ row, column, rowIndex }: PartialByKeys<CellFuncArg<D>, 'cellValue'>) => any;
    title?: ({ column }: { column: ColumnProps<D> }) => any;
  };
  cellRender?: CellRender;
}

export interface PButtonProps extends ButtonProps {
  content?: string;
  icon?: string;
  type?: ButtonType;
}

export interface ToolbarButtonProps extends PButtonProps {
  code: string;
  dropdowns?: ToolbarButtonProps[];
  size?: 'small' | 'large' | 'middle';
}

export interface ToolbarConfig {
  buttons?: Array<ToolbarButtonProps>;
  tools?: Array<{ code: string; icon: string; type?: ButtonType; disabled?: boolean; size?: 'small' | 'large' | 'middle' }>;
  disabled?: boolean;
}

export interface ResponsePathConfig<D = Recordable> {
  /*非分页取值路径*/
  list?: string | ((res: Recordable) => D[]);
  /*分页取值路径*/
  result?: string | ((res: Recordable) => D[]);
  total?: string | ((res: Recordable) => D[]);
  /*提示信息取值路径*/
  message?:
    | string
    | ((res: Recordable) => string | { status: string; content: string; icon?: string });
}

declare type HandlerMulti = (ids: Array<string | number>) => any;

export interface AjaxConfig<F = Recordable> {
  query: (Q: { page?: IPage; form: Partial<F> }) => Promise<Recordable>;
  multiDelete?: HandlerMulti;
}

export interface ProxyConfig<D = Recordable, F = Recordable> {
  // 结果集 取值路径
  response?: ResponsePathConfig<D>;
  ajax: AjaxConfig<F>;
}

export interface PageConfig {
  pageSizes?: number[];
  pageSize?: number;
}

export interface SelectConfig<D = Recordable> {
  multiple?: boolean;
  showCount?: boolean;
  getCheckboxProps?: (record: D) => { disabled?: boolean };
}

export type PGridProps<D = Recordable, F = Recordable> = {
  selectConfig?: SelectConfig<D>;
  rowKey?: string;
  manualFetch?: boolean;
  align?: 'left' | 'right' | 'center'
  formConfig?: PFormProps<F>;
  columns?: ColumnProps<D>[];
  toolbarConfig?: ToolbarConfig;
  pageConfig?: PageConfig;
  proxyConfig?: ProxyConfig<D, F>;
  tableConfig?: TableProps<D>;
  scrollMode?: 'outer' | 'inner';
  /**
   * 适应展示区到页面顶部的高度，通常和容器最上的y值有关（正比）
   */
  fitHeight?: number;
  /**
   * 虚拟列表 Y区计算高度
   */
  renderY?: number;
};

export interface RenderOptions {
  /**
   * 渲染器名称
   */
  name?: string;
  /**
   * 目标组件渲染的参数
   */
  props?: { [key: string]: any };
  /**
   * 目标组件渲染的属性
   */
  attrs?: { [key: string]: any };
  /**
   * 目标组件渲染的事件
   */
  events?: { [key: string]: (...args: any[]) => any };
  /**
   * 多目标渲染
   */
  children?: any[];
  /**
   * 选项
   */
  options?: IOption[];
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 校验触发器
   * @param cusFields field或者field数组
   */
  handleTrigger?: (cusFields?: string | string[]) => void;
  /**
   * 延迟校验触发器
   * @param cusFields field或者field数组
   * @param time 延迟时间
   */
  handleDelayTrigger?: (cusFields?: string | string[], time?: number) => void;
}

export interface RenderFormParams<F = Recordable> {
  data: F;
  field?: string;
}

export interface RenderTableParams<D = Recordable> {
  data?: D[];
  row: D;
  rowIndex?: number;
  field?: string;
  title?: string;
}

export interface PGridInstance<D = Recordable, F = Recordable> {
  commitProxy: {
    query: () => Promise<D[]>;
    reload: () => Promise<D[]>;
    reloadPage: () => Promise<D[]>;
    passQuery: (query: Partial<F>, lazy?: boolean) => Promise<void | D[]>;
  };
  selectedRowKeys: string[] | number[];
  selectedRecords: D[];
  $table: Recordable;
  $form: Recordable;
  getFormData: () => Partial<F>;
  setLoadings: (value: boolean) => void;
  setBtnLoading: (code: string, status: boolean) => void;
  resizeTable: () => void;
}

export interface PFormInstance {
  reset: () => void;
  $form: Recordable;
}

export interface PromisePickerInstance<D = Recordable> {
  pick: () => Promise<{ row: D; field?: string }>;
  pickMultiple: () => Promise<D[]>;
  grid: PGridInstance<D>;
  hide: () => void;
}

export interface PFormBlockInstance {
  $form: Recordable;
}

export interface PFormGroupInstance<F = Recordable> {
  activeKey: number;
  setActiveKey: (activeKey: number) => void;
  validateAll: () => Promise<void>;
  validate: (index: number) => Promise<void>;
}
