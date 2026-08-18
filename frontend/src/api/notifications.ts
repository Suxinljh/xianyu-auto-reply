import http from './http'

export interface NotificationChannel {
  id: number
  name: string
  type: string
  config: any
  enabled: boolean
  user_id?: number
  created_at?: string
  updated_at?: string
}

export interface MessageNotification {
  id: number
  cookie_id: string
  channel_id: number
  enabled: boolean
  channel_name?: string
  channel_type?: string
  channel_config?: any
}

// 获取通知渠道列表
export async function getNotificationChannels(): Promise<NotificationChannel[]> {
  const { data } = await http.get<NotificationChannel[]>('/notification-channels')
  return data || []
}

// 创建通知渠道（config 为 JSON 字符串）
export async function createNotificationChannel(params: { name: string; type: string; config: string }): Promise<any> {
  const { data } = await http.post('/notification-channels', params)
  return data
}

// 更新通知渠道
export async function updateNotificationChannel(channel_id: number, params: { name: string; config: string; enabled: boolean }): Promise<any> {
  const { data } = await http.put('/notification-channels/' + channel_id, params)
  return data
}

// 删除通知渠道
export async function deleteNotificationChannel(channel_id: number): Promise<any> {
  const { data } = await http.delete('/notification-channels/' + channel_id)
  return data
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
