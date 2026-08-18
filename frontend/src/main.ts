import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/theme.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

// 通过 JS 运行时设置主题变量（内联 style 优先级最高，确保覆盖 Element Plus 默认蓝色）
// 此方式写入 documentElement.style，不会被组件内/后加载的 CSS 覆盖
const rootEl = document.documentElement
const themeVars: Record<string, string> = {
  '--el-color-primary': '#5B58FF',
  '--el-color-primary-rgb': '91, 88, 255',
  '--el-color-primary-light-3': '#8C8AFF',
  '--el-color-primary-light-5': '#ADABFF',
  '--el-color-primary-light-7': '#CDCCFF',
  '--el-color-primary-light-8': '#DEDDFF',
  '--el-color-primary-light-9': '#EEEEFF',
  '--el-color-primary-dark-2': '#4846CC',
  '--el-border-radius-base': '12px',
  '--el-border-radius-small': '12px',
  '--el-border-radius-round': '12px',
  '--el-button-border-radius': '12px',
  '--el-input-border-radius': '12px',
  '--el-card-border-radius': '12px',
  '--el-dialog-border-radius': '12px',
  '--el-table-border-radius': '12px',
  '--el-box-shadow': 'none',
  '--el-box-shadow-light': 'none',
  '--el-box-shadow-lighter': 'none',
  '--el-box-shadow-dark': 'none',
}
Object.entries(themeVars).forEach(([k, v]) => rootEl.style.setProperty(k, v))

// 运行时注入高优先级样式（追加到 <head> 末尾，覆盖 Element Plus 默认值）
const styleEl = document.createElement('style')
styleEl.textContent = [
  '.el-button, .el-button--default, .el-button--primary, .el-button--small, .el-button--large { border-radius: 12px !important; }',
  '.el-card, .el-dialog, .el-message-box { border-radius: 12px; }',
  '.el-input__wrapper, .el-select__wrapper, .el-textarea__inner { border-radius: 12px; }'
].join('\n')
document.head.appendChild(styleEl)

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
