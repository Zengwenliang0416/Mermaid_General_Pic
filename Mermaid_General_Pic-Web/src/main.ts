import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import zhLocale from './locales/zh.json'
import enLocale from './locales/en.json'
import router from './router'
import App from './App.vue'
import { ref } from 'vue'

// 获取存储的语言设置或使用浏览器语言
const savedLocale = localStorage.getItem('locale') || (navigator.language.startsWith('zh') ? 'zh' : 'en')

// 创建 Element Plus 语言配置的响应式引用
export const elementLocale = ref(savedLocale === 'zh' ? zhCn : en)

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    zh: zhLocale,
    en: enLocale
  }
})

// 创建应用实例
const app = createApp(App)

// 配置 Element Plus
app.use(ElementPlus, {
  locale: elementLocale.value
})

// 安装插件
app.use(createPinia())
app.use(i18n)
app.use(router)

// 挂载应用
app.mount('#app')
