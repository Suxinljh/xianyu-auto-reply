import axios, { AxiosError, type AxiosInstance } from 'axios'

const TOKEN_KEY = 'xianyu_auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// axios 实例：同源部署时为空 baseURL（走相对路径），跨域时可通过 VITE_BACKEND_TARGET 指定
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_TARGET || '',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：注入 Bearer Token
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 时清理 token 并跳转登录
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      clearToken()
      // 避免在登录页重复跳转（hash 路由，登录页为 #/login）
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http
