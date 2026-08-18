import http from './http'

export interface CookieDetail {
  id: string
  value: string
  enabled?: boolean
  auto_confirm?: boolean
  remark?: string
  pause_duration?: number
  username?: string
  password?: string
  show_browser?: boolean
  created_at?: string
}

export interface CookieListItem {
  id: string
  value: string
  enabled: boolean
  auto_confirm: boolean
  remark: string
  pause_duration: number
}

// 获取当前用户的所有 cookie id
export async function listCookies(): Promise<string[]> {
  const { data } = await http.get<string[]>('/cookies')
  return data || []
}

// 获取当前用户所有 cookie 详情
export async function listCookieDetails(): Promise<CookieListItem[]> {
  const { data } = await http.get<CookieListItem[]>('/cookies/details')
  return data || []
}

// 新增 cookie
export async function addCookie(params: { id: string; value: string }): Promise<any> {
  const { data } = await http.post('/cookies', params)
  return data
}

// 更新 cookie 值
export async function updateCookieValue(cid: string, value: string): Promise<any> {
  const { data } = await http.put('/cookies/' + cid, { value })
  return data
}

// 更新账号信息（用户名/密码/是否显示浏览器）
export async function updateCookieAccountInfo(cid: string, params: { value?: string; username?: string; password?: string; show_browser?: boolean }): Promise<any> {
  const { data } = await http.post('/cookie/' + cid + '/account-info', params)
  return data
}

// 获取账号详情
export async function getCookieDetails(cid: string): Promise<CookieDetail> {
  const { data } = await http.get('/cookie/' + cid + '/details')
  return data
}

// 删除 cookie
export async function deleteCookie(cid: string): Promise<any> {
  const { data } = await http.delete('/cookies/' + cid)
  return data
}

// 启停状态
export async function setCookieStatus(cid: string, enabled: boolean): Promise<any> {
  const { data } = await http.put('/cookies/' + cid + '/status', { enabled })
  return data
}

// 自动确认发货
export async function setAutoConfirm(cid: string, auto_confirm: boolean): Promise<any> {
  const { data } = await http.put('/cookies/' + cid + '/auto-confirm', { auto_confirm })
  return data
}

// 备注
export async function setCookieRemark(cid: string, remark: string): Promise<any> {
  const { data } = await http.put('/cookies/' + cid + '/remark', { remark })
  return data
}

// 暂停时长（秒）
export async function setPauseDuration(cid: string, pause_duration: number): Promise<any> {
  const { data } = await http.put('/cookies/' + cid + '/pause-duration', { pause_duration })
  return data
}

// 保存账号登录表单（可用于扫码/密码登录初始化）
export async function passwordLogin(params: { account_id: string; account: string; password: string; show_browser?: boolean }): Promise<any> {
  const { data } = await http.post('/password-login', params)
  return data
}

// 生成扫码登录
export async function generateQrLogin(): Promise<any> {
  const { data } = await http.post('/qr-login/generate')
  return data
}

// 检查扫码登录状态
export async function checkQrLogin(session_id: string): Promise<any> {
  const { data } = await http.get('/qr-login/check/' + session_id)
  return data
}
