import type { Responsive } from '@vue-ui-kit/ant';
import type { Ref } from 'vue';
import { get24rest, labelColDict } from '@vue-ui-kit/ant';
import { computed, getCurrentInstance, isRef, onBeforeUnmount, onMounted, ref, unref } from 'vue';

/** 容器宽度 → itemCol span */
const widthToItemCol = (width: number): number => {
  console.log('width', width);
  if (width >= 1700) return 4; // 6列
  if (width >= 1200) return 6; // 4列
  if (width >= 800) return 8; // 3列
  if (width >= 600) return 12; // 2列
  return 24; // 1列
};

/** itemCol → labelColDict 的 viewport key（两者 col span 对齐） */
const itemColToLabelKey = (col: number): keyof Responsive => {
  if (col <= 6) return 'xxl'; // xxl viewport: defaultItemResponsive.xxl = 6
  if (col <= 8) return 'xl'; //  xl  viewport: defaultItemResponsive.xl  = 8
  if (col <= 12) return 'md'; // md  viewport: defaultItemResponsive.md  = 12
  return 'sm'; //                  sm  viewport: defaultItemResponsive.sm  = 24
};

/**
 * 基于容器实际宽度的表单响应式布局
 *
 * @param containerEl 被观察的容器元素（支持 Ref 或原始 HTMLElement）。不传时自动取当前组件实例的上级 DOM
 * @returns
 *  - `containerWidth` 容器当前宽度 px
 *  - `itemSpan`        当前宽度下每个表单项应占的 col span
 *  - `getLabelCol(n)` 传入标签字符数（默认4），返回对应的 labelCol Responsive 对象
 *  - `getTailSpan(n)`  传入该 form 的表单项数量，返回末行按钮区域剩余的 col span
 */
export const usePFormResponsive = (
  containerEl?: HTMLElement | Ref<HTMLElement | undefined | null>,
) => {
  const instance = getCurrentInstance();

  const containerWidth = ref(0);
  let resizeObserver: ResizeObserver | null = null;

  const resolveEl = (): HTMLElement | null => {
    if (containerEl) {
      return unref(containerEl) ?? null;
    }
    // 未传 containerEl 时，取当前组件根元素的父级 DOM
    const rootEl = instance?.proxy?.$el;
    if (rootEl instanceof HTMLElement) return rootEl.parentElement;
    if (rootEl instanceof Node) return rootEl.parentElement as HTMLElement | null;
    return null;
  };

  const initObserver = () => {
    const el = resolveEl();
    if (!el) {
      setTimeout(initObserver, 200);
      return;
    }
    containerWidth.value = el.offsetWidth;
    resizeObserver = new ResizeObserver((entries) => {
      containerWidth.value = entries[0]?.contentRect.width ?? el.offsetWidth;
    });
    resizeObserver.observe(el);
  };

  const dispose = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  onMounted(initObserver);
  onBeforeUnmount(dispose);

  const itemSpan = computed(() => widthToItemCol(containerWidth.value));

  const getLabelCol = (charCount = 4): Responsive => {
    const clampedCount = Math.min(Math.max(Math.round(charCount), 1), 9);
    const key = itemColToLabelKey(itemSpan.value);
    const span = labelColDict[clampedCount]?.[key] ?? 6;
    return { xs: span, sm: span, md: span, lg: span, xl: span, xxl: span };
  };

  const getTailSpan = (itemCount: number | Ref<number> = 0) => {
    const count = isRef(itemCount) ? itemCount.value : itemCount;
    if (count <= 0) return 24;
    return get24rest(Array.from({ length: count }, () => itemSpan.value));
  };

  return { containerWidth, itemSpan, getLabelCol, getTailSpan };
};
