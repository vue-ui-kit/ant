import type EVirtTable from 'e-virt-table';
import type { ConfigType } from 'e-virt-table';

/** --p-* → --evt-* 桥接（与 canvas-theme.scss / storybook theme.css 对齐） */
const P_TO_EVT_BRIDGE: ReadonlyArray<readonly [evt: string, p: string, fallback: string]> = [
  ['--evt-border-color', '--p-border-color', '#d9d9d9'],
  ['--evt-header-bg-color', '--p-table-thead-bg-color', '#f2f3f6'],
  ['--evt-body-bg-color', '--p-table-row-bg-color', '#fff'],
  ['--evt-stripe-color', '--p-striped-bg-color', '#f2f3f6'],
  ['--evt-highlight-hover-row-color', '--p-table-row-hover-bg-color', '#e6e7ea'],
  ['--evt-select-border-color', '--p-primary-color', '#4096ff'],
  ['--evt-sort-icon-color', '--p-primary-color', '#4096ff'],
  ['--evt-required-color', '--p-danger-color', '#f5222d'],
  ['--evt-error-tip-color', '--p-danger-color', '#f5222d'],
  ['--evt-error-tip-icon-color', '--p-danger-color', '#f5222d'],
  ['--evt-readonly-color', '--p-table-row-bg-color', '#fff'],
  ['--evt-scroller-track-color', '--p-table-row-bg-color', '#fff'],
];

/** Canvas 专用色（无 --p-* 对应项，storybook 默认值） */
const LIGHT_EVT_DEDICATED: Readonly<Record<string, string>> = {
  '--evt-header-text-color': '#1d2129',
  '--evt-body-text-color': '#4e5969',
  '--evt-footer-text-color': '#4e5969',
  '--evt-readonly-text-color': '#4e5969',
  '--evt-scroller-color': '#dee0e3',
  '--evt-scroller-focus-color': '#bbbec4',
  '--evt-edit-bg-color': '#fcf6ed',
  '--evt-footer-bg-color': '#fafafa',
  '--evt-autofill-point-border-color': '#fff',
  '--evt-editor-bg-color': '#fff',
  '--evt-editor-text-color': '#333',
  '--evt-context-menu-bg-color': '#fff',
  '--evt-context-menu-text-color': '#333',
  '--evt-context-menu-item-hover-bg-color': '#f5f5f5',
};

const DARK_EVT_DEDICATED: Readonly<Record<string, string>> = {
  '--evt-header-text-color': '#a3a6ad',
  '--evt-body-text-color': '#cfd3dc',
  '--evt-footer-text-color': '#cfd3dc',
  '--evt-readonly-text-color': '#a3a6ad',
  '--evt-scroller-color': '#414243',
  '--evt-scroller-track-color': '#141414',
  '--evt-scroller-focus-color': '#a3a6ad',
  '--evt-edit-bg-color': '#141414',
  '--evt-footer-bg-color': '#262727',
  '--evt-autofill-point-border-color': '#a3a6ad',
  '--evt-editor-bg-color': '#434343',
  '--evt-editor-text-color': '#cfd3dc',
  '--evt-context-menu-bg-color': '#141414',
  '--evt-context-menu-text-color': '#cfd3dc',
  '--evt-context-menu-item-hover-bg-color': '#414243',
};

export function isDarkThemeRoot(el: HTMLElement = document.documentElement): boolean {
  return (
    el.getAttribute('theme-mode') === 'dark' ||
    el.getAttribute('data-theme') === 'dark' ||
    el.classList.contains('dark')
  );
}

/**
 * 将 --p-* 解析值写入 --evt-*，覆盖 e-virt-table 运行时注入的浅色默认值。
 */
export function syncCanvasThemeCssVars(el: HTMLElement = document.documentElement): void {
  const computed = getComputedStyle(el);
  for (const [evt, p, fallback] of P_TO_EVT_BRIDGE) {
    const value = computed.getPropertyValue(p).trim() || fallback;
    el.style.setProperty(evt, value);
  }
  const dedicated = isDarkThemeRoot(el) ? DARK_EVT_DEDICATED : LIGHT_EVT_DEDICATED;
  for (const [evt, value] of Object.entries(dedicated)) {
    el.style.setProperty(evt, value);
  }
}

export type CanvasTableThemeHandle = {
  disconnect: () => void;
  sync: () => void;
};

/**
 * 同步 CSS 变量并 loadConfig，使 Canvas 表格与 PGrid 主题一致。
 */
export function bindCanvasTableThemeSync(options: {
  getTable: () => EVirtTable | null;
  getConfig: () => ConfigType;
}): CanvasTableThemeHandle {
  const sync = () => {
    syncCanvasThemeCssVars();
    const table = options.getTable();
    if (table) {
      table.loadConfig(options.getConfig());
    }
  };

  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['theme-mode', 'class', 'data-theme'],
  });

  sync();

  return {
    sync,
    disconnect: () => observer.disconnect(),
  };
}
