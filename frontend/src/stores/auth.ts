import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'
import { getToken, setToken, clearToken } from '@/api/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const username = ref<string>('')
  const userId = ref<number | null>(null)
  const isAdmin = ref<boolean>(false)

  const isLoggedIn = computed(() => !!token.value)

  // 尝试恢复会话（从本地存储读出用户信息）
  function restoreSession() {
    try {
      const raw = localStorage.getItem('xianyu_auth_user')
      if (raw) {
        const u = JSON.parse(raw)
        username.value = u.username || ''
        userId.value = u.user_id ?? null
        isAdmin.value = !!u.is_admin
      }
    } catch (e) {
      // ignore
    }
  }

  async function login(params: { username?: string; email?: string; password: string }): Promise<boolean> {
    const res = await apiLogin(params)
    if (res.success && res.token) {
      token.value = res.token
      setToken(res.token)
      username.value = res.username || ''
      userId.value = res.user_id ?? null
      isAdmin.value = !!res.is_admin
      localStorage.setItem('xianyu_auth_user', JSON.stringify({
        username: username.value,
        user_id: userId.value,
        is_admin: isAdmin.value
      }))
      return true
    }
    return false
  }

  async function logout() {
    try { await apiLogout() } catch (e) { /* ignore */ }
    token.value = null
    username.value = ''
    userId.value = null
    isAdmin.value = false
    clearToken()
    localStorage.removeItem('xianyu_auth_user')
  }

  restoreSession()

  return { token, username, userId, isAdmin, isLoggedIn, login, logout }
})
