import http from './http'

export interface AdminUser {
  id: number
  username: string
  email?: string
  is_active?: boolean
  created_at?: string
  cookie_count?: number
  card_count?: number
}

// 获取所有用户（管理员）
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await http.get('/admin/users')
  return data?.users || []
}

// 删除用户（管理员）
export async function deleteAdminUser(user_id: number): Promise<any> {
  const { data } = await http.delete('/admin/users/' + user_id)
  return data
}
