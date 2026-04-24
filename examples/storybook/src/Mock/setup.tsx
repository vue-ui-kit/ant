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
      autoBoxSizeOffset: { right: 16, bottom: 16 },
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
    // PGrid 等处的 Icon 渲染：优先返回带颜色的 VNode，未命中时回退 @ant-design/icons-vue
    icon: {
      render: (name: string) => {
        if (name === 'SampleStorybookSvg') {
          return h(
            'span',
            { style: { display: 'inline-flex', alignItems: 'center', lineHeight: 0 } },
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 16 16',
                width: '1em',
                height: '1em',
                fill: 'none',
                'aria-hidden': 'true',
              },
              [
                h('rect', { width: '16', height: '16', rx: '3', fill: '#13c2c2' }),
                h('path', {
                  d: 'M4 8h8M8 4v8',
                  stroke: '#fff',
                  'stroke-width': '1.5',
                  'stroke-linecap': 'round',
                }),
              ],
            ),
          );
        }
        return null;
      },
    },
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
