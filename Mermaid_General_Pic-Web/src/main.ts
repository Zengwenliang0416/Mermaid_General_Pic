import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 根据浏览器语言设置 Element Plus 的语言
const locale = navigator.language.startsWith('zh') ? zhCn : en

app.use(createPinia())
   .use(router)
   .use(ElementPlus, {
     locale,
   })
   .use(i18n)
   .mount('#app')
