export type ClientPlatform = 'WECHAT_H5' | 'WECHAT_MINI_PROGRAM' | 'UNKNOWN'

export const getClientPlatform = (): ClientPlatform => {
  let platform: ClientPlatform = 'UNKNOWN'

  // #ifdef H5
  platform = 'WECHAT_H5'
  // #endif

  // #ifdef MP-WEIXIN
  platform = 'WECHAT_MINI_PROGRAM'
  // #endif

  return platform
}
