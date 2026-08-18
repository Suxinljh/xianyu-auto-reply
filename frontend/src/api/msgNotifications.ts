import http from './http'

export interface MessageNotification {
  id: number
  cookie_id: string
  channel_id: number
  enabled: boolean
  channel_name?: string
  channel_type?: string
  channel_config?: any
}

// 获取账号的消息通知配置
export async function getAccountNotifications(cid: string): Promise<MessageNotification[]> {
  const { data } = await http.get('/message-notifications/' + cid)
  return data || []
}

// 设置账号的消息通知
export async function setMessageNotification(cid: string, params: { channel_id: number; enabled: boolean }): Promise<any> {
  const { data } = await http.post('/message-notifications/' + cid, params)
  return data
}

// 删除账号的消息通知配置
export async function deleteMessageNotification(notification_id: number): Promise<any> {
  const { data } = await http.delete('/message-notifications/' + notification_id)
  return data
}
