import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import UIKit, { setup } from '@vue-ui-kit/ant';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

// 测试多种导入方式 - 请取消注释其中一种来测试:
// 方式1: 直接导入
import '@vue-ui-kit/ant/style.scss';

// 方式2: 使用dist路径 (如果方式1失败，请注释方式1，取消注释这行)
// import '@vue-ui-kit/ant/dist/style.scss';

// 方式3: CSS文件 (如果scss都失败，请使用这个)
// import '@vue-ui-kit/ant/style.css';

// 测试setup功能
setup({
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

createApp(App).use(Antd).use(UIKit).mount('#app');
