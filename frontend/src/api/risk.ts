import http from './http'

export interface RiskLog {
  id?: number
  cookie_id?: string
  event_type?: string
  event_description?: string
  processing_result?: string
  processing_status?: string
  error_message?: string
  created_at?: string
  [key: string]: any
}

// 获取风控日志（管理员）
export async function getRiskLogs(params: { cookie_id?: string; limit?: number; offset?: number } = {}): Promise<{ data: RiskLog[]; total: number }> {
  const { data } = await http.get('/admin/risk-control-logs', { params })
  return { data: data?.data || [], total: data?.total || 0 }
}

// 删除风控日志（管理员）
export async function deleteRiskLog(log_id: number): Promise<any> {
  const { data } = await http.delete('/risk-control-logs/' + log_id)
  return data
}
