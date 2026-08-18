import http from './http'

export interface TableDataResp {
  success: boolean
  data: Record<string, any>[]
  columns: string[]
  count: number
}

// 允许查看的表及其中文描述
export const ALLOWED_TABLES: { name: string; label: string }[] = [
  { name: 'users', label: '用户' },
  { name: 'cookies', label: '账号Cookie' },
  { name: 'cookie_status', label: '账号状态' },
  { name: 'keywords', label: '关键词' },
  { name: 'default_replies', label: '默认回复' },
  { name: 'default_reply_records', label: '默认回复记录' },
  { name: 'ai_reply_settings', label: 'AI回复设置' },
  { name: 'ai_conversations', label: 'AI对话' },
  { name: 'ai_item_cache', label: 'AI商品缓存' },
  { name: 'item_info', label: '商品信息' },
  { name: 'message_notifications', label: '消息通知' },
  { name: 'cards', label: '卡券' },
  { name: 'delivery_rules', label: '发货规则' },
  { name: 'notification_channels', label: '通知渠道' },
  { name: 'user_settings', label: '用户设置' },
  { name: 'system_settings', label: '系统设置' },
  { name: 'email_verifications', label: '邮箱验证' },
  { name: 'captcha_codes', label: '验证码' },
  { name: 'orders', label: '订单' },
  { name: 'item_replay', label: '商品回复' },
]

// 获取表数据（管理员）
export async function getTableData(table_name: string): Promise<TableDataResp> {
  const { data } = await http.get('/admin/data/' + table_name)
  return data
}

// 删除表记录（管理员）
export async function deleteTableRecord(table_name: string, record_id: string): Promise<any> {
  const { data } = await http.delete('/admin/data/' + table_name + '/' + record_id)
  return data
}

// 清空表数据（管理员）
export async function clearTableData(table_name: string): Promise<any> {
  const { data } = await http.delete('/admin/data/' + table_name)
  return data
}
