import http from './http'

export interface Keyword {
  keyword: string
  reply: string
  item_id?: string
  type?: string
  image_url?: string
}

export interface DefaultReply {
  enabled: boolean
  reply_content: string
  reply_once: boolean
}

// 获取账号关键词列表
export async function getKeywords(cid: string): Promise<Keyword[]> {
  const { data } = await http.get<Keyword[]>('/keywords/' + cid)
  return data || []
}

// 更新账号关键词（body.keywords: { key -> reply }）
export async function updateKeywords(cid: string, keywords: Record<string, string>): Promise<any> {
  const { data } = await http.post('/keywords/' + cid, { keywords })
  return data
}

// 删除指定索引的关键词
export async function deleteKeyword(cid: string, index: number): Promise<any> {
  const { data } = await http.delete('/keywords/' + cid + '/' + index)
  return data
}

// 获取账号默认回复
export async function getDefaultReply(cid: string): Promise<DefaultReply> {
  const { data } = await http.get('/default-replies/' + cid)
  return data
}

// 更新账号默认回复
export async function updateDefaultReply(cid: string, params: DefaultReply): Promise<any> {
  const { data } = await http.put('/default-replies/' + cid, params)
  return data
}
