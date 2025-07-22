interface TreeConfig {
  children?: string;
}

type TreeDefaultHandler<T> = (
  arent: null | ITreeAble<T>,
  parent: ITreeAble<T>[],
  treeData: (
    item: T | ITreeAble<T>,
    index?: number,
    treeData?: ITreeAble<T>[],
    paths?: string[],
    parent?: null | ITreeAble<T>,
    nodes?: Array<T | ITreeAble<T>>,
  ) => any,
  iterate: any,
  context: string[],
  path: Array<T | ITreeAble<T>>,
  node: string,
  parseChildren: TreeConfig,
) => any;

const helperCreateTreeFunc = <T extends Recordable>(handle: TreeDefaultHandler<T>) => {
  return function (
    treeData: ITreeAble<T>[],
    iterate: (item: T | ITreeAble<T>) => any,
    options?: TreeConfig,
    context?: any,
  ) {
    const opts = options || {};
    const optChildren = opts.children || 'children';
    return handle(null, treeData, iterate, context, [], [], optChildren, opts);
  };
};
const eachTreeItem = <T extends Recordable>(
  parent: null | ITreeAble<T>,
  treeData: ITreeAble<T>[],
  iterate: (
    item: T | ITreeAble<T>,
    index?: number,
    treeData?: ITreeAble<T>[],
    paths?: string[],
    parent?: null | ITreeAble<T>,
    nodes?: Array<T | ITreeAble<T>>,
  ) => any,
  context: any,
  path: string[],
  node: Array<T | ITreeAble<T>>,
  parseChildren: string,
) => {
  let paths: string[], nodes: Array<T | ITreeAble<T>>;
  treeData.forEach((item, index) => {
    paths = path.concat(['' + index]);
    nodes = node.concat([item]);
    iterate.call(context, item, index, treeData, paths, parent, nodes);
    if (item && parseChildren) {
      paths.push(parseChildren);
      eachTreeItem(item, item[parseChildren] || [], iterate, context, paths, nodes, parseChildren);
    }
  });
};
export const eachTree = helperCreateTreeFunc(eachTreeItem);
