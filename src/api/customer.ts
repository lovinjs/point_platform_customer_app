import type {
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
