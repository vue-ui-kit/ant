import type { PFormItemProps } from '#/antProxy';
import { defaultItemResponsive } from '@/utils/core';
import { Grid } from 'ant-design-vue';
import { computed, type Ref } from 'vue';

const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
type Breakpoint = (typeof breakpointOrder)[number];

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

export function useFormRowLayout<F extends Recordable>(items: Ref<PFormItemProps<F>[]>) {
  const screens = Grid.useBreakpoint();
  const activeBreakpoint = computed<Breakpoint>(() => {
    return breakpointOrder.find((breakpoint) => screens.value[breakpoint]) ?? 'xs';
  });
  const fieldRowCount = computed(() => {
    const spans = items.value
      .filter((item) => item.itemRender || item.slots?.default)
      .map((item) => getItemSpan(item, activeBreakpoint.value));
    return countRows(spans);
  });

  return {
    isSingleRow: computed(() => items.value.length > 0 && fieldRowCount.value === 1),
  };
}
