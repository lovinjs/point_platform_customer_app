import { appConfig } from '@/config/app'
import { CustomerAuthUnavailableError } from './error'
import { startH5WechatLogin } from './h5'
import { getWechatMiniProgramLoginCode } from './mini-program'

export { CustomerAuthUnavailableError } from './error'
export { isWechatBrowser } from './h5'

export const startCustomerLogin = async (returnPath: string): Promise<void> => {
  if (!appConfig.wechatAuthEnabled) {
    throw new CustomerAuthUnavailableError('微信登录后端尚未启用')
  }

  // #ifdef H5
  startH5WechatLogin(returnPath)
  return
  // #endif

  // #ifdef MP-WEIXIN
  await getWechatMiniProgramLoginCode()
  throw new CustomerAuthUnavailableError('微信小程序登录接口将在小程序阶段接入')
  // #endif

  throw new CustomerAuthUnavailableError('当前运行平台暂不支持微信登录')
}
