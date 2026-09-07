import { resolveApiUrl } from '@/config/app'
import { CustomerAuthUnavailableError } from './error'

export const isWechatBrowser = (): boolean =>
  typeof navigator !== 'undefined' && /micromessenger/i.test(navigator.userAgent)

export const startH5WechatLogin = (returnPath: string): void => {
  if (!isWechatBrowser()) {
    throw new CustomerAuthUnavailableError('请在微信内打开页面后再登录')
  }
  const authorizeUrl = resolveApiUrl(
    `/api/v1/h5/auth/wechat/start?returnPath=${encodeURIComponent(returnPath)}`,
  )
  window.location.assign(authorizeUrl)
}
