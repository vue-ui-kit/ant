/**
 * 按视口从元素左上角铺满宽高（与 storybook 中 v-rest / v-height / v-width 同源思路），
 * 用于外层未声明高度、需由根节点自行占满可视区域的场景。
 */

export type AutoViewportBoxOffsetInput =
  | number
  | string
  | { right?: number; bottom?: number }
  | undefined;

export interface AutoViewportBoxOffset {
  right: number;
  bottom: number;
}

function parseSingle(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px)?$/i);
    if (match) {
      return Number.parseFloat(match[1]);
    }
  }
  return 0;
}

/** 解析与 v-rest 一致的偏移：数字/字符串同时作用于 right+bottom；对象可单独指定 */
export function parseAutoViewportBoxOffset(
  value: AutoViewportBoxOffsetInput,
): AutoViewportBoxOffset {
  if (value === undefined || value === null || value === '') {
    return { right: 0, bottom: 0 };
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const o = value as { right?: number; bottom?: number };
    return {
      right: typeof o.right === 'number' ? o.right : 0,
      bottom: typeof o.bottom === 'number' ? o.bottom : 0,
    };
  }
  const single = parseSingle(value);
  return { right: single, bottom: single };
}

function findResizeAncestor(start: Element | null): Element {
  let el: Element | null = start?.parentElement ?? null;
  while (el && el !== document.body) {
    const overflow = window.getComputedStyle(el).overflow;
    if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') {
      return el;
    }
    el = el.parentElement;
  }
  return document.body;
}

/**
 * 宽/高先按「视口内从元素左上角到右/下边缘」计算。
 *
 * 宽度会再与**直接父元素**布局框取较小值，避免嵌套在侧栏 + flex 列等窄容器里仍按整屏宽度赋值，
 * 从而撑出页面级横向滚动条。
 *
 * 高度不做 parent 截断：autoBoxSize 的语义就是「一直撑到视口底」。若对 parent 取 min，
 * 遇到「父容器没有明确高度、靠子元素内容撑开」的常见布局（外层未写死高度，p-grid 根节点
 * 自身决定可视高度），会形成循环依赖（子依赖父、父又靠子撑开），导致高度被截成极小值，
 * 反映到 PGrid 上就是表体下方出现大面积空白。
 */
export function applyViewportRestSize(el: HTMLElement, offset: AutoViewportBoxOffset): void {
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let targetW = Math.max(0, vw - rect.left - offset.right);
  const targetH = Math.max(0, vh - rect.top - offset.bottom);

  const parent = el.parentElement;
  if (parent) {
    const pr = parent.getBoundingClientRect();
    if (pr.width > 0) {
      targetW = Math.min(targetW, pr.width);
    }
  }

  el.style.width = `${targetW}px`;
  el.style.height = `${targetH}px`;
}

function clearViewportBoxSize(el: HTMLElement): void {
  el.style.width = '';
  el.style.height = '';
}

export interface AutoViewportBoxControllerOptions {
  /** 每次尺寸写回后回调（例如触发内部表格 resize） */
  onLayout?: () => void;
}

export interface AutoViewportBoxController {
  attach: () => void;
  update: () => void;
  destroy: () => void;
}

export function createAutoViewportBoxController(
  getEl: () => HTMLElement | null | undefined,
  getOffset: () => AutoViewportBoxOffset,
  options?: AutoViewportBoxControllerOptions,
): AutoViewportBoxController {
  let resizeObserver: ResizeObserver | null = null;
  let onWinResize: (() => void) | null = null;

  const disconnect = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (onWinResize) {
      window.removeEventListener('resize', onWinResize);
      onWinResize = null;
    }
  };

  const update = () => {
    const el = getEl();
    if (!el) return;
    applyViewportRestSize(el, getOffset());
    options?.onLayout?.();
  };

  const attach = () => {
    disconnect();
    const el = getEl();
    if (!el) return;

    onWinResize = () => update();
    window.addEventListener('resize', onWinResize);

    const scrollAncestor = findResizeAncestor(el);
    resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(scrollAncestor);
    if (el.parentElement) {
      resizeObserver.observe(el.parentElement);
    }

    update();
  };

  return {
    attach,
    update,
    destroy: () => {
      disconnect();
      const el = getEl();
      if (el) clearViewportBoxSize(el);
    },
  };
}
