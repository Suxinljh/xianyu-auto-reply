import http from './http'

export interface DashboardStats {
  total_accounts?: number
  total_items?: number
  total_orders?: number
  total_keywords?: number
  [key: string]: any
}

// 管理员统计
export async function getAdminStats(): Promise<DashboardStats> {
  const { data } = await http.get('/admin/stats')
  return data || {}
}

// 获取商品数量（按账号）
export async function getItems(cid?: string): Promise<any[]> {
  const url = cid ? ('/items/' + cid) : '/items'
  const { data } = await http.get(url)
  return Array.isArray(data) ? data : (data?.data || [])
}

// 获取订单列表
export async function getOrders(params?: Record<string, any>): Promise<any[]> {
  const { data } = await http.get('/api/orders', { params })
  return Array.isArray(data) ? data : (data?.data || [])
}
