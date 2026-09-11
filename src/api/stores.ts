import type { PageResult } from '@/types/api'
import type { CustomerStore } from '@/types/store'
import { get } from './http'

export const getCustomerStores = (
  pageNum: number,
  pageSize: number,
  keyword?: string,
): Promise<PageResult<CustomerStore>> => {
  const query = [
    `pageNum=${encodeURIComponent(pageNum)}`,
    `pageSize=${encodeURIComponent(pageSize)}`,
  ]
  const normalizedKeyword = keyword?.trim()
  if (normalizedKeyword) {
    query.push(`keyword=${encodeURIComponent(normalizedKeyword)}`)
  }
  return get<PageResult<CustomerStore>>(
    `/api/v1/customer/stores?${query.join('&')}`,
    { authenticated: false },
  )
}

export const getCustomerStore = (storeId: number): Promise<CustomerStore> =>
  get<CustomerStore>(`/api/v1/customer/stores/${encodeURIComponent(storeId)}`, {
    authenticated: false,
  })
