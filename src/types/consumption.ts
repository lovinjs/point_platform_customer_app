export type ConsumptionOrderStatus =
  | 'PENDING_CONFIRM'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVERSED'

export interface CustomerPendingConsumption {
  orderNo: string
  storeId: number
  storeName: string
  consumePoints: number
  amountCent: number
  expiresTime: string
  orderStatus: ConsumptionOrderStatus
  remark: string | null
  createTime: string
}

export interface ConsumptionConfirmationResult {
  orderNo: string
  storeId: number
  storeName: string
  consumePoints: number
  amountCent: number
  availablePoints: number
  orderStatus: ConsumptionOrderStatus
  completedTime: string
}
