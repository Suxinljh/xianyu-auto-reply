import http from './http'

export interface LogEntry {
  timestamp: string
  level: string
  source: string
  function: string
  line: number
  message: string
}

// 获取日志
export async function getLogs(params: { lines?: number; level?: string; source?: string } = {}): Promise<LogEntry[]> {
  const { data } = await http.get('/logs', { params })
  return data?.logs || []
}

// 获取日志统计
export async function getLogStats(): Promise<any> {
  const { data } = await http.get('/logs/stats')
  return data?.stats || {}
}

// 清空日志
export async function clearLogs(): Promise<any> {
  const { data } = await http.post('/logs/clear')
  return data
}
