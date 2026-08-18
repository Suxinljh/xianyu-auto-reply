import http from './http'

export interface ItemInfo {
  id?: number
  cookie_id: string
  item_id: string
  item_title?: string
  item_description?: string
  item_category?: string
  item_price?: string
  item_detail?: string
  item_detail_parsed?: any
  is_multi_spec?: boolean
  multi_quantity_delivery?: boolean
  created_at?: string
  updated_at?: string
}

export interface GetItemsResp {
  items: ItemInfo[]
}

// 获取当前用户所有商品
export async function getAllItems(): Promise<ItemInfo[]> {
  const { data } = await http.get<GetItemsResp>('/items')
  return data?.items || []
}

// 获取指定账号商品
export async function getItemsByCookie(cookie_id: string): Promise<ItemInfo[]> {
  const { data } = await http.get<GetItemsResp>('/items/cookie/' + cookie_id)
  return data?.items || []
}

// 获取商品详情
export async function getItemDetail(cookie_id: string, item_id: string): Promise<ItemInfo> {
  const { data } = await http.get('/items/' + cookie_id + '/' + item_id)
  return data?.item || {} as ItemInfo
}

// 更新商品详情
export async function updateItemDetail(cookie_id: string, item_id: string, item_detail: string): Promise<any> {
  const { data } = await http.put('/items/' + cookie_id + '/' + item_id, { item_detail })
  return data
}

// 删除商品
export async function deleteItem(cookie_id: string, item_id: string): Promise<any> {
  const { data } = await http.delete('/items/' + cookie_id + '/' + item_id)
  return data
}

// 批量删除商品
export async function batchDeleteItems(items: { cookie_id: string; item_id: string }[]): Promise<any> {
  const { data } = await http.delete('/items/batch', { data: { items } })
  return data
}

// 单页搜索闲鱼商品
export async function searchItems(params: { keyword: string; page?: number; page_size?: number }): Promise<any> {
  const { data } = await http.post('/items/search', params)
  return data
}
