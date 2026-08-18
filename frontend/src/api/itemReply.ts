import http from './http'

export interface ItemReply {
  id?: number
  item_id: string
  cookie_id: string
  reply_content: string
  item_title?: string
  created_at?: string
  updated_at?: string
}

// 获取当前用户所有商品回复
export async function getAllItemReplies(): Promise<ItemReply[]> {
  const { data } = await http.get('/itemReplays')
  return data?.items || []
}

// 获取指定账号商品回复
export async function getItemRepliesByCookie(cookie_id: string): Promise<ItemReply[]> {
  const { data } = await http.get('/itemReplays/cookie/' + cookie_id)
  return data?.items || []
}

// 更新商品回复
export async function updateItemReply(cookie_id: string, item_id: string, reply_content: string): Promise<any> {
  const { data } = await http.put('/item-reply/' + cookie_id + '/' + item_id, { reply_content })
  return data
}

// 删除商品回复
export async function deleteItemReply(cookie_id: string, item_id: string): Promise<any> {
  const { data } = await http.delete('/item-reply/' + cookie_id + '/' + item_id)
  return data
}

// 批量删除商品回复
export async function batchDeleteItemReplies(items: { cookie_id: string; item_id: string }[]): Promise<any> {
  const { data } = await http.delete('/item-reply/batch', { data: { items } })
  return data
}
