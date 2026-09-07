const normalizeBaseUrl = (value: string | undefined): string => {
  const normalized = value?.trim() ?? ''
  return normalized === '/' ? '' : normalized.replace(/\/$/, '')
}

export const appConfig = Object.freeze({
  title: import.meta.env.VITE_APP_TITLE?.trim() || '平台积分',
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  wechatAuthEnabled: import.meta.env.VITE_WECHAT_AUTH_ENABLED === 'true',
  requestTimeoutMs: 10_000,
})

export const resolveApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${appConfig.apiBaseUrl}${normalizedPath}`
}
