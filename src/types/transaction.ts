export type PointLedgerType =
  | 'RECHARGE'
  | 'CONSUME'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'REVERSAL'

export type PointLedgerBusinessType =
  | 'RECHARGE_ORDER'
  | 'CONSUMPTION_ORDER'
  | 'RECHARGE_REFUND'
  | 'MANUAL_ADJUSTMENT'

export type RechargeOrderStatus = 'CREATED' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
export type RechargeChannel = 'OFFLINE' | 'WECHAT_PAY'
export type PaymentMethod = 'PLATFORM_QR' | 'BANK_TRANSFER' | 'OTHER'

export type ConsumptionOrderStatus =
  | 'PENDING_CONFIRM'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVERSED'

export interface CustomerPointBalance {
  availablePoints: number
  updatedTime: string | null
}

export interface CustomerPointLedger {
  ledgerNo: string
  deltaPoints: number
  balanceAfter: number
  ledgerType: PointLedgerType
  businessType: PointLedgerBusinessType
  businessNo: string
  storeId: number | null
  storeName: string | null
  remark: string | null
  createTime: string
}

export interface CustomerRechargeOrder {
  orderNo: string
  storeId: number
  storeName: string | null
  rechargePoints: number
  amountCent: number
  channel: RechargeChannel
  paymentMethod: PaymentMethod
  orderStatus: RechargeOrderStatus
  remark: string | null
  paidTime: string | null
  completedTime: string | null
  createTime: string
}

export interface CustomerConsumptionOrder {
  orderNo: string
  storeId: number
  storeName: string | null
  consumePoints: number
  amountCent: number
  orderStatus: ConsumptionOrderStatus
  remark: string | null
  expiresTime: string
  confirmedTime: string | null
  completedTime: string | null
  createTime: string
}
