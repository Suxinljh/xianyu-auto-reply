// 前后端分离开发时，API 基址可通过 VITE_BACKEND_TARGET 环境变量覆盖。
// 生产同源部署时为空字符串，走相对路径（由后端/FastAPI 托管）。
export const API_BASE = import.meta.env.VITE_BACKEND_TARGET || ''

export default API_BASE
