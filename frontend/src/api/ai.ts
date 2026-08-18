import http from './http'

export interface AIReplySettings {
  ai_enabled: boolean
  model_name: string
  api_key: string
  base_url: string
  max_discount_percent: number
  max_discount_amount: number
  max_bargain_rounds: number
  custom_prompts: string
}

// 获取账号 AI 回复设置
export async function getAIReplySettings(cookie_id: string): Promise<AIReplySettings> {
  const { data } = await http.get('/ai-reply-settings/' + cookie_id)
  return data
}

// 更新账号 AI 回复设置
export async function updateAIReplySettings(cookie_id: string, params: Partial<AIReplySettings>): Promise<any> {
  const { data } = await http.put('/ai-reply-settings/' + cookie_id, params)
  return data
}

// 测试 AI 回复
export async function testAIReply(cookie_id: string, params: { message: string }): Promise<any> {
  const { data } = await http.post('/ai-reply-test/' + cookie_id, params)
  return data
}
