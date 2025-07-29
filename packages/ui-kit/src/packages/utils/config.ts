import { PFormProps, PGridProps } from '#/antProxy';
import { ConfigType } from 'e-virt-table';
import { clone } from 'xe-utils';

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
  };
  canvasTable?: ConfigType;
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
    fitHeight: 170,
  },
  canvasTable: {
    DISABLED: true,
  },
};

// 当前配置（可被修改）
let currentConfig: UIKitConfig = clone(defaultConfig);

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
  };
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
