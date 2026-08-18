import http from './http'

export interface OrderInfo {
  order_id: string
  item_id?: string
  buyer_id?: string
  spec_name?: string
  spec_value?: string
  quantity?: string
  amount?: string
  order_status?: string
  cookie_id?: string
  created_at?: string
  updated_at?: string
}

// 获取当前用户订单
export async function getOrders(): Promise<OrderInfo[]> {
  const { data } = await http.get('/api/orders')
  return data?.data || []
}
