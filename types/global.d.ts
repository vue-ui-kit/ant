//<editor-fold desc="👇全局类型补丁，不需要引用👇">
declare type Nullable<T> = T | null;
declare type NonNullable<T> = T extends null | undefined ? never : T;
declare type Recordable<T = any> = Record<string, T>;
declare type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T;
};
declare type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
type Mutable<
  T extends {
    readonly [key: string]: any;
  },
> = {
  -readonly [P in keyof T]: T[P];
};

type RequiredByKeys<T, K extends keyof T = keyof T> = Omit<
  T & Required<Pick<T, K & keyof T>>,
  never
>;
type PartialByKeys<T, K extends keyof T = keyof T> = Omit<T, K & keyof T> &
  Partial<Pick<T, K & keyof T>> extends infer U
  ? { [K in keyof U]: U[K] }
  : never;
type DeepPick<T extends Record<string, any>, U extends string> = (
  U extends string
    ? U extends `${infer F}.${infer R}`
      ? (arg: {
        [K in F]: DeepPick<T[F], R>;
      }) => void
      : U extends keyof T
        ? (arg: Pick<T, U>) => void
        : (arg: unknown) => void
    : never
  ) extends (arg: infer Z) => void
  ? Z
  : never;

//选项类型
interface IOption<T = any> {
  value: T;
  label: string;
  color?: string;
}

interface OptionGroup<T> {
  label?: string;
  options: IOption<T>[];
}

//树形结构类型
type ITreeAble<T, U = void> = U extends void
  ? T & { children?: ITreeAble<T>[] }
  : U extends string
    ? T & { [key in U]?: ITreeAble<T, U>[] }
    : T;
declare type WrapID<T extends Recordable> = {
  readonly id: string | number;
} & { [K in keyof T]: T[K] }
declare type TimeoutHandle = ReturnType<typeof window.setTimeout>;
declare type IntervalHandle = ReturnType<typeof window.setInterval>;
declare type GrowToSize<T, N extends number, A extends T[]> =
  A['length'] extends N ? A : GrowToSize<T, N, [...A, T]>;

declare type FixedArray<T, N extends number> = GrowToSize<T, N, []>;

interface AError {
  code: number;
  message?: string;
  retryable?: boolean;
  tag?: string;
}

interface IResponse<T = any> {
  data: T;
  error: AError;
  trace_id: string;
}

interface IPage {
  /**
   * 第几页
   */
  page: number;
  /**
   * 一页显示的数量
   */
  size: number;
}

interface WrapList<T> {
  /**
   * 列表
   */
  list: T[];
}

interface WrapPage<T> {
  /**
   * 列表
   */
  list: T[];
  /**
   * 当前页码
   */
  page: number;
  /**
   * 总页数
   */
  pages?: string[];
  /**
   * 每页数量
   */
  size: number;
  /**
   * 总数量
   */
  total: number;
}

interface ISchema {
  id: number;
  /**
   * 操作人
   */
  operator?: string;
  /**
   * 创建人
   */
  create_by?: string;
  /**
   * 更新人
   */
  update_by?: string;
  /**
   * 更新时间
   */
  update_time?: number;
  /**
   * 创建时间
   */
  create_time?: number;
  /**
   * 创建人
   */
  creator?: string;
}

declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';
//</editor-fold>
