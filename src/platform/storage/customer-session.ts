import type { CustomerSession } from '@/types/auth'

const CUSTOMER_SESSION_KEY = 'point-platform:customer-session:v1'
const EXPIRY_SKEW_MS = 30_000

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isCustomerSession = (value: unknown): value is CustomerSession => {
  if (!isRecord(value) || !isRecord(value.user)) {
    return false
  }
  return (
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    typeof value.tokenType === 'string' &&
    typeof value.expiresInSeconds === 'number' &&
    typeof value.expiresAt === 'string' &&
    typeof value.user.customerId === 'number' &&
    typeof value.user.phoneBound === 'boolean' &&
    typeof value.user.consumePinConfigured === 'boolean' &&
    typeof value.user.availablePoints === 'number' &&
    Number.isSafeInteger(value.user.availablePoints) &&
    value.user.availablePoints >= 0
  )
}

export const isSessionExpired = (session: CustomerSession): boolean => {
  const expiresAt = Date.parse(session.expiresAt)
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now() + EXPIRY_SKEW_MS
}

export const loadCustomerSession = (): CustomerSession | null => {
  const stored: unknown = uni.getStorageSync(CUSTOMER_SESSION_KEY)
  if (!isCustomerSession(stored) || isSessionExpired(stored)) {
    clearCustomerSession()
    return null
  }
  return stored
}

export const saveCustomerSession = (session: CustomerSession): void => {
  if (!isCustomerSession(session) || isSessionExpired(session)) {
    throw new Error('登录信息无效或已经过期')
  }
  uni.setStorageSync(CUSTOMER_SESSION_KEY, session)
}

export const clearCustomerSession = (): void => {
  uni.removeStorageSync(CUSTOMER_SESSION_KEY)
}

export const getCustomerAccessToken = (): string | null => {
  const session = loadCustomerSession()
  return session?.accessToken ?? null
}
