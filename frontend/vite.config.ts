import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后端地址（开发时代理目标）
const BACKEND_TARGET = process.env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // 开发环境下把所有非静态路径代理到后端，避免逐个接口遗漏
      '/api': { target: BACKEND_TARGET, changeOrigin: true },
      // 业务接口大多是顶层路径（非 /api 前缀）
      '/health': { target: BACKEND_TARGET, changeOrigin: true },
      '/cookies': { target: BACKEND_TARGET, changeOrigin: true },
      '/cookie': { target: BACKEND_TARGET, changeOrigin: true },
      '/keywords': { target: BACKEND_TARGET, changeOrigin: true },
      '/items': { target: BACKEND_TARGET, changeOrigin: true },
      '/cards': { target: BACKEND_TARGET, changeOrigin: true },
      '/delivery-rules': { target: BACKEND_TARGET, changeOrigin: true },
      '/orders': { target: BACKEND_TARGET, changeOrigin: true },
      '/admin': { target: BACKEND_TARGET, changeOrigin: true },
      '/logs': { target: BACKEND_TARGET, changeOrigin: true },
      '/qr-login': { target: BACKEND_TARGET, changeOrigin: true },
      '/password-login': { target: BACKEND_TARGET, changeOrigin: true },
      '/face-verification': { target: BACKEND_TARGET, changeOrigin: true },
      '/default-replies': { target: BACKEND_TARGET, changeOrigin: true },
      '/message-notifications': { target: BACKEND_TARGET, changeOrigin: true },
      '/notification-channels': { target: BACKEND_TARGET, changeOrigin: true },
      '/system-settings': { target: BACKEND_TARGET, changeOrigin: true },
      '/registration-status': { target: BACKEND_TARGET, changeOrigin: true },
      '/login-info-status': { target: BACKEND_TARGET, changeOrigin: true },
      '/registration-settings': { target: BACKEND_TARGET, changeOrigin: true },
      '/login-info-settings': { target: BACKEND_TARGET, changeOrigin: true },
      '/upload-image': { target: BACKEND_TARGET, changeOrigin: true },
      '/ai-reply-settings': { target: BACKEND_TARGET, changeOrigin: true },
      '/ai-reply-test': { target: BACKEND_TARGET, changeOrigin: true },
      '/backup': { target: BACKEND_TARGET, changeOrigin: true },
      '/system': { target: BACKEND_TARGET, changeOrigin: true },
      '/item-reply': { target: BACKEND_TARGET, changeOrigin: true },
      '/itemReplays': { target: BACKEND_TARGET, changeOrigin: true },
      '/risk-control-logs': { target: BACKEND_TARGET, changeOrigin: true },
      '/user-settings': { target: BACKEND_TARGET, changeOrigin: true },
      '/login': { target: BACKEND_TARGET, changeOrigin: true },
      '/logout': { target: BACKEND_TARGET, changeOrigin: true },
      '/verify': { target: BACKEND_TARGET, changeOrigin: true },
      '/register': { target: BACKEND_TARGET, changeOrigin: true },
      '/change-admin-password': { target: BACKEND_TARGET, changeOrigin: true },
      '/generate-captcha': { target: BACKEND_TARGET, changeOrigin: true },
      '/verify-captcha': { target: BACKEND_TARGET, changeOrigin: true },
      '/send-verification-code': { target: BACKEND_TARGET, changeOrigin: true },
      '/send-message': { target: BACKEND_TARGET, changeOrigin: true },
      '/xianyu': { target: BACKEND_TARGET, changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
