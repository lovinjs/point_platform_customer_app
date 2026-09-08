import type { PageResult } from '@/types/api'
import type {
  CustomerConsumptionOrder,
  CustomerPointBalance,
  CustomerPointLedger,
  CustomerRechargeOrder,
} from '@/types/transaction'
import { get } from './http'

const pageQuery = (pageNum: number, pageSize: number): string =>
  `pageNum=${encodeURIComponent(pageNum)}&pageSize=${encodeURIComponent(pageSize)}`

export const getCustomerPointBalance = (): Promise<CustomerPointBalance> =>
  get<CustomerPointBalance>('/api/v1/customer/points/balance')

export const getCustomerPointLedger = (
  pageNum: number,
  pageSize: number,
): Promise<PageResult<CustomerPointLedger>> =>
  get<PageResult<CustomerPointLedger>>(
    `/api/v1/customer/points/ledger?${pageQuery(pageNum, pageSize)}`,
  )

export const getCustomerRechargeOrders = (
  pageNum: number,
  pageSize: number,
): Promise<PageResult<CustomerRechargeOrder>> =>
  get<PageResult<CustomerRechargeOrder>>(
    `/api/v1/customer/recharge-orders?${pageQuery(pageNum, pageSize)}`,
  )

export const getCustomerConsumptionOrders = (
  pageNum: number,
  pageSize: number,
): Promise<PageResult<CustomerConsumptionOrder>> =>
  get<PageResult<CustomerConsumptionOrder>>(
    `/api/v1/customer/consumption-orders?${pageQuery(pageNum, pageSize)}`,
  )
