// 环境变量配置
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  staticUrl: import.meta.env.VITE_STATIC_URL || 'http://localhost:3000/static'
}; 