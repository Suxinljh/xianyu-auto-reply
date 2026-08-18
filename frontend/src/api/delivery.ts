import http from './http'

export interface DeliveryRule {
  id: number
  keyword: string
  card_id: number
  delivery_count: number
  enabled: boolean
  description?: string
  delivery_times?: number
  created_at?: string
  updated_at?: string
  card_name?: string
  card_type?: string
  is_multi_spec?: boolean
  spec_name?: string
  spec_value?: string
}

export interface DeliveryRuleInput {
  keyword: string
  card_id: number
  delivery_count?: number
  enabled?: boolean
  description?: string
}

// 获取发货规则列表
export async function getDeliveryRules(): Promise<DeliveryRule[]> {
  const { data } = await http.get<DeliveryRule[]>('/delivery-rules')
  return data || []
}

// 获取单个发货规则
export async function getDeliveryRule(rule_id: number): Promise<DeliveryRule> {
  const { data } = await http.get('/delivery-rules/' + rule_id)
  return data
}

// 创建发货规则
export async function createDeliveryRule(params: DeliveryRuleInput): Promise<any> {
  const { data } = await http.post('/delivery-rules', params)
  return data
}

// 更新发货规则
export async function updateDeliveryRule(rule_id: number, params: DeliveryRuleInput): Promise<any> {
  const { data } = await http.put('/delivery-rules/' + rule_id, params)
  return data
}

// 删除发货规则
export async function deleteDeliveryRule(rule_id: number): Promise<any> {
  const { data } = await http.delete('/delivery-rules/' + rule_id)
  return data
}
