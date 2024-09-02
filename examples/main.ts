import { createApp } from 'vue';
import App from './App.vue';
import antKit from '../index';
import { capitalize, isNumber, isString, toString } from 'lodash-es';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/index.scss';

const app = createApp(App);
app.use(Antd);
app.use(antKit);
antKit.addFormatter({
  capitalize: ({ cellValue }) =>
    isString(cellValue) || isNumber(cellValue) ? capitalize(toString(cellValue)) : cellValue,
});
app.mount('#app');
