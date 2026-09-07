export interface CustomerAccountView {
  customerId: number
  nickname: string | null
  avatarUrl: string | null
  maskedPhone: string | null
  phoneBound: boolean
  consumePinConfigured: boolean
  availablePoints: number
}

export interface CustomerSession {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  expiresAt: string
  user: CustomerAccountView
}

export interface LoginTicketExchangeResult extends CustomerSession {
  returnPath: string | null
}

export interface PhoneVerificationDispatchResult {
  expiresInSeconds: number
  resendAfterSeconds: number
}
