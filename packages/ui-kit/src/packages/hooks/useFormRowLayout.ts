import type { PFormItemProps } from '#/antProxy';
import { defaultItemResponsive } from '@/utils/core';
import type { ColProps } from 'ant-design-vue';
import { computed, onBeforeUnmount, type Ref, ref, watch } from 'vue';
import { omit } from 'xe-utils';

const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
type Breakpoint = (typeof breakpointOrder)[number];
const breakpointMinWidth: Record<Breakpoint, number> = {
  xxl: 1600,
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576,
  xs: 0,
};

function getActiveBreakpoint(width: number): Breakpoint {
  return breakpointOrder.find((breakpoint) => width >= breakpointMinWidth[breakpoint]) ?? 'xs';
}

function resolveItemCol<F extends Recordable>(
  item: PFormItemProps<F>,
  breakpoint: Breakpoint,
): ColProps {
  if (!item.col) {
    return item.span ? { span: item.span } : { span: defaultItemResponsive[breakpoint] ?? 24 };
  }

  const baseCol = omit(item.col, [...breakpointOrder]) as ColProps;
  const activeBreakpointIndex = breakpointOrder.indexOf(breakpoint);
  for (const responsiveBreakpoint of breakpointOrder.slice(activeBreakpointIndex)) {
    const responsive = item.col[responsiveBreakpoint];
    if (typeof responsive === 'number') return { ...baseCol, span: responsive };
    if (responsive && typeof responsive === 'object') return { ...baseCol, ...responsive };
  }

  return baseCol;
}

function getItemSpan<F extends Recordable>(item: PFormItemProps<F>, breakpoint: Breakpoint) {
  const activeBreakpointIndex = breakpointOrder.indexOf(breakpoint);
  for (const responsiveBreakpoint of breakpointOrder.slice(activeBreakpointIndex)) {
    const responsive = item.col?.[responsiveBreakpoint];
    if (typeof responsive === 'number') return responsive;
    if (responsive && typeof responsive === 'object' && typeof responsive.span === 'number') {
      return responsive.span;
    }
  }
  if (typeof item.col?.span === 'number') return item.col.span;
  if (typeof item.span === 'number') return item.span;
  return defaultItemResponsive[breakpoint] ?? 24;
}

function countRows(spans: number[]) {
  if (spans.length === 0) return 0;
  let rows = 1;
  let currentSpan = 0;
  for (const span of spans) {
    if (currentSpan + span > 24) {
      rows += 1;
      currentSpan = span;
    } else {
      currentSpan += span;
    }
  }
  return rows;
}

export function useFormRowLayout<F extends Recordable>(
  items: Ref<PFormItemProps<F>[]>,
  containerRef: Readonly<Ref<HTMLElement | null>>,
) {
  const containerWidth = ref(0);
  let resizeObserver: ResizeObserver | null = null;

  const disconnect = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  watch(
    containerRef,
    (container) => {
      disconnect();
      if (!container) {
        containerWidth.value = 0;
        return;
      }

      const updateWidth = () => {
        containerWidth.value = container.getBoundingClientRect().width;
      };
      updateWidth();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(container);
      }
    },
    { flush: 'post' },
  );
  onBeforeUnmount(disconnect);

  const activeBreakpoint = computed<Breakpoint>(() => getActiveBreakpoint(containerWidth.value));
  const resolvedItems = computed<PFormItemProps<F>[]>(() => {
    if (containerWidth.value <= 0) return items.value;
    return items.value.map((item) => ({
      ...item,
      col: resolveItemCol(item, activeBreakpoint.value),
    }));
  });
  const fieldRowCount = computed(() => {
    const spans = resolvedItems.value
      .filter((item) => item.itemRender || item.slots?.default)
      .map((item) => getItemSpan(item, activeBreakpoint.value));
    return countRows(spans);
  });

  return {
    resolvedItems,
    isSingleRow: computed(() => resolvedItems.value.length > 0 && fieldRowCount.value === 1),
  };
}
