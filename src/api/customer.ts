import type {
  ConsumePinStatus,
  ConsumePinResetTokenResult,
  CustomerAccountView,
  PhoneVerificationDispatchResult,
} from '@/types/auth'
import { get, post, put } from './http'

export const getCustomerProfile = (): Promise<CustomerAccountView> =>
  get<CustomerAccountView>('/api/v1/customer/me')

export const requestPhoneVerificationCode = (
  phone: string,
): Promise<PhoneVerificationDispatchResult> =>
  post<PhoneVerificationDispatchResult>('/api/v1/customer/phone/verification-codes', {
    phone,
  })

export const bindCustomerPhone = (
  phone: string,
  verificationCode: string,
): Promise<CustomerAccountView> =>
  put<CustomerAccountView>('/api/v1/customer/phone', {
    phone,
    verificationCode,
  })

export const getConsumePinStatus = (): Promise<ConsumePinStatus> =>
  get<ConsumePinStatus>('/api/v1/customer/security/consume-pin/status')

export const setCustomerConsumePin = (newPin: string): Promise<ConsumePinStatus> =>
  post<ConsumePinStatus>('/api/v1/customer/security/consume-pin', { newPin })

export const changeCustomerConsumePin = (
  currentPin: string,
  newPin: string,
): Promise<ConsumePinStatus> =>
  put<ConsumePinStatus>('/api/v1/customer/security/consume-pin', {
    currentPin,
    newPin,
  })

export const requestConsumePinResetVerificationCode = (): Promise<PhoneVerificationDispatchResult> =>
  post<PhoneVerificationDispatchResult>(
    '/api/v1/customer/security/consume-pin/reset/verification-codes',
    {},
  )

export const createConsumePinResetToken = (
  verificationCode: string,
): Promise<ConsumePinResetTokenResult> =>
  post<ConsumePinResetTokenResult>('/api/v1/customer/security/consume-pin/reset/tokens', {
    verificationCode,
  })

export const resetCustomerConsumePin = (
  resetToken: string,
  newPin: string,
): Promise<ConsumePinStatus> =>
  put<ConsumePinStatus>('/api/v1/customer/security/consume-pin/reset', {
    resetToken,
    newPin,
  })
