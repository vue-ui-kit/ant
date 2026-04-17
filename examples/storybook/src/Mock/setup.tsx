import UIKit from '@vue-ui-kit/ant';
import { Tooltip as ATooltip } from 'ant-design-vue';
import type { App, VNode } from 'vue';
import { h } from 'vue';

export const setupUIKit = (app: App) => {
  // 测试setup功能
  UIKit.setup({
    grid: {
      align: 'center',
      fitHeight: 32,
      lazyReset: true,
    },
    form: {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    },
    canvasTable: {
      ENABLE_FINDER: true,
      AUTO_ROW_HEIGHT: true,
    },
    // 自定义蓝色 tooltip，模拟替换全局 a-tooltip
    renderTooltip: (defaultSlot: () => VNode, content: string | (() => VNode)) =>
      h(
        ATooltip,
        { color: '#1677ff', overlayInnerStyle: { borderRadius: '6px' } },
        {
          default: defaultSlot,
          title: typeof content === 'string' ? () => content : content,
        },
      ),
  });

  UIKit.addFormatter({ test: () => 'test' });
  UIKit.addRender('capitalize', {
    renderDefault: ({}, { row, field }) => {
      return row[field]?.toUpperCase() ?? [];
    },
  });
  UIKit.addRender('colorFullScore', {
    renderDefault: ({}, { row, field }) => {
      return (
        <div style={{ color: row[field] > 99 ? 'gold' : row[field] > 60 ? 'green' : 'red' }}>
          {row[field]}
        </div>
      );
    },
  });
  app.use(UIKit);
};
