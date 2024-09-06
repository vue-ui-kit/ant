import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import UIKit from '@vue-ui-kit/ant'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

UIKit.addFormatter({ test: () => 'test' })

createApp(App).use(Antd).use(UIKit).mount('#app')
