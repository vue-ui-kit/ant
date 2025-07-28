import UIKit from '@vue-ui-kit/ant';
import type { App } from 'vue';
export const setupUIKit = (app: App) => {
  // 测试setup功能
  UIKit.setup({
    grid: {
      align: 'center',
      fitHeight: 180,
      lazyReset: true,
    },
    form: {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
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
