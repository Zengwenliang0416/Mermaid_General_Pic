import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createI18n } from 'vue-i18n'
import zhLocale from './locales/zh.json'
import router from './router'
import App from './App.vue'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh: zhLocale
  }
})

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(ElementPlus)
app.use(i18n)
app.use(router)

// 挂载应用
app.mount('#app')
