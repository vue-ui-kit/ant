import { PFormProps, PGridProps } from '#/antProxy';
import { ConfigType } from 'e-virt-table';
import { clone } from 'xe-utils';
import type { VNode } from 'vue';

// 全局配置接口
export interface UIKitConfig {
  form?: {
    labelCol?: any;
    wrapperCol?: any;
  };
  grid?: {
    align?: 'left' | 'right' | 'center';
    lazyReset?: boolean;
    fitHeight?: number;
    fitCanvasHeight?: number;
    striped?: boolean;
  };
  canvasTable?: ConfigType;
  /**
   * 自定义 tooltip 渲染函数，替换全局所有 a-tooltip。
   * @param defaultSlot 原 tooltip 触发元素（图标等）
   * @param content tooltip 内容，字符串或返回 VNode 的函数
   */
  renderTooltip?: (defaultSlot: () => VNode, content: string | (() => VNode)) => VNode;
}

// 默认配置
const defaultConfig: UIKitConfig = {
  form: {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  },
  grid: {
    align: 'left',
    lazyReset: false,
    fitHeight: 30,
    striped: false,
  },
  canvasTable: {
    DISABLED: true,
    ENABLE_FINDER: true,
    AUTO_ROW_HEIGHT: true,
  },
};

// 当前配置（可被修改）
let currentConfig: UIKitConfig = clone(defaultConfig, true);

// 设置配置
export function setUIKitConfig(config: Partial<UIKitConfig>): void {
  currentConfig = {
    form: {
      ...currentConfig.form,
      ...config.form,
    },
    grid: {
      ...currentConfig.grid,
      ...config.grid,
    },
    canvasTable: {
      ...currentConfig.canvasTable,
      ...config.canvasTable,
    },
    renderTooltip: config.renderTooltip ?? currentConfig.renderTooltip,
  };
}

// 获取自定义 tooltip 渲染函数
export function getTooltipRenderer(): UIKitConfig['renderTooltip'] {
  return currentConfig.renderTooltip;
}

// 获取配置
export function getUIKitConfig(): UIKitConfig {
  return currentConfig;
}

// 获取表单默认配置
export function getFormDefaults(): Partial<PFormProps> {
  return {
    labelCol: currentConfig.form?.labelCol,
    wrapperCol: currentConfig.form?.wrapperCol,
  };
}

// 获取Grid默认配置
export function getGridDefaults(): Partial<PGridProps> {
  return {
    align: currentConfig.grid?.align,
    lazyReset: currentConfig.grid?.lazyReset,
    fitHeight: currentConfig.grid?.fitHeight,
    striped: currentConfig.grid?.striped,
  };
}

// 获取CanvasTable默认配置
export function getCanvasTableDefaults(): ConfigType {
  return currentConfig.canvasTable || ({} as ConfigType);
}

// 重置为默认配置
export function resetUIKitConfig(): void {
  currentConfig = JSON.parse(JSON.stringify(defaultConfig));
}
