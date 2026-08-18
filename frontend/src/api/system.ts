import http from './http'

// 获取系统设置（后端已剔除敏感字段）
export async function getSystemSettings(): Promise<Record<string, string>> {
  const { data } = await http.get('/system-settings')
  return data || {}
}

// 更新系统设置（仅管理员）
export async function updateSystemSetting(key: string, value: string, description?: string): Promise<any> {
  const { data } = await http.put('/system-settings/' + key, { value, description })
  return data
}
