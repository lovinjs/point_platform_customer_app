import type {
  ConsumptionConfirmationResult,
  CustomerPendingConsumption,
} from '@/types/consumption'
import { get, post } from './http'

export const getPendingConsumption = (): Promise<CustomerPendingConsumption | null> =>
  get<CustomerPendingConsumption | null>('/api/v1/customer/consumption-orders/pending')

export const confirmConsumption = (
  orderNo: string,
  consumePin: string,
): Promise<ConsumptionConfirmationResult> =>
  post<ConsumptionConfirmationResult>(
    `/api/v1/customer/consumption-orders/${encodeURIComponent(orderNo)}/confirm`,
    { consumePin },
  )
