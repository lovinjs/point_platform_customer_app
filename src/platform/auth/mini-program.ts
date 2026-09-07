import { CustomerAuthUnavailableError } from './error'

export const getWechatMiniProgramLoginCode = (): Promise<string> =>
  new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (result) => {
        if (typeof result.code === 'string' && result.code.length > 0) {
          resolve(result.code)
          return
        }
        reject(new CustomerAuthUnavailableError('微信小程序未返回有效登录凭证'))
      },
      fail: () => reject(new CustomerAuthUnavailableError('微信小程序登录失败，请重试')),
    })
  })
