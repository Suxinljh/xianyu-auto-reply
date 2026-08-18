import http from './http'

export interface LoginResult {
  success: boolean
  token?: string
  message: string
  user_id?: number
  username?: string
  is_admin?: boolean
}

export interface UserInfo {
  user_id: number
  username: string
  is_admin: boolean
  token: string
}

// 用户名/邮箱 密码登录
export async function login(params: { username?: string; email?: string; password: string }): Promise<LoginResult> {
  const { data } = await http.post<LoginResult>('/login', params)
  return data
}

// 登出
export async function logout(): Promise<void> {
  try {
    await http.post('/logout')
  } catch (e) {
    // 忽略登出请求自身错误
  }
}

// 注册开关状态
export async function getRegistrationStatus(): Promise<{ enabled: boolean; message: string }> {
  const { data } = await http.get('/registration-status')
  return data
}

// 登录页是否显示默认信息
export async function getLoginInfoStatus(): Promise<{ enabled: boolean }> {
  const { data } = await http.get('/login-info-status')
  return data
}

// 注册
export async function register(params: { username: string; email: string; password: string; verification_code: string }): Promise<{ success: boolean; message: string }> {
  const { data } = await http.post('/register', params)
  return data
}

// 修改管理员密码
export async function changeAdminPassword(params: { current_password: string; new_password: string }): Promise<{ success: boolean; message?: string }> {
  const { data } = await http.post('/change-admin-password', params)
  return data
}
