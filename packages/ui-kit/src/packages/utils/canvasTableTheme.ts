import type EVirtTable from 'e-virt-table';
import type { ConfigType } from 'e-virt-table';
import { syncSelectAreaSvgFilter } from '@/utils/canvasSelectAreaFilter';

/**
 * 默认值和 --p-* 映射由 canvas-theme.scss 处理。
 * e-virt-table 会自动把所有 *_COLOR / *_FONT 配置映射为 --evt-* 并读取，
 * 因此这里不再写入 inline 变量，也不需要维护变量白名单。
 */
export function syncCanvasThemeCssVars(el: HTMLElement = document.documentElement): void {
  // 强制完成当前样式计算，随后 Config.updateCssVar() 读取最新级联值。
  getComputedStyle(el).getPropertyValue('--evt-border-color');
  // 从表格根读取生效色（可继承业务侧局部 --evt-select-area-color）
  syncSelectAreaSvgFilter(el);
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
  /** 用于读取局部 CSS 变量（如示例页容器上的 --evt-select-area-color） */
  getEl?: () => HTMLElement | null;
}): CanvasTableThemeHandle {
  const sync = () => {
    syncCanvasThemeCssVars(options.getEl?.() || document.documentElement);
    const table = options.getTable();
    if (table) {
      table.loadConfig(options.getConfig());
    }
  };

  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['theme-mode', 'class', 'data-theme', 'style'],
  });

  sync();

  return {
    sync,
    disconnect: () => observer.disconnect(),
  };
}
