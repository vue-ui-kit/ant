import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import UIKit, { setup } from '@vue-ui-kit/ant';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

// 测试新的样式引用方式
// 可以选择以下任一种方式：
import '@vue-ui-kit/ant/style.scss';  // 引用scss源文件
// import '@vue-ui-kit/ant/style.css';   // 引用编译后的css

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
  }
});

UIKit.addFormatter({ test: () => 'test' });

createApp(App).use(Antd).use(UIKit).mount('#app');
