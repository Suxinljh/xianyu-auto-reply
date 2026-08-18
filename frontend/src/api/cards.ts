import http from './http'

export interface Card {
  id: number
  name: string
  type: string
  api_config?: any
  text_content?: string
  data_content?: string
  image_url?: string
  description?: string
  enabled?: boolean
  delay_seconds?: number
  is_multi_spec?: boolean
  spec_name?: string
  spec_value?: string
  created_at?: string
  updated_at?: string
}

// 获取卡券列表
export async function getCards(): Promise<Card[]> {
  const { data } = await http.get<Card[]>('/cards')
  return data || []
}

// 获取卡券详情
export async function getCard(card_id: number): Promise<Card> {
  const { data } = await http.get('/cards/' + card_id)
  return data
}

// 创建卡券
export async function createCard(params: Partial<Card>): Promise<any> {
  const { data } = await http.post('/cards', params)
  return data
}

// 更新卡券
export async function updateCard(card_id: number, params: Partial<Card>): Promise<any> {
  const { data } = await http.put('/cards/' + card_id, params)
  return data
}

// 删除卡券
export async function deleteCard(card_id: number): Promise<any> {
  const { data } = await http.delete('/cards/' + card_id)
  return data
}
