<template>
  <view class="page-shell transactions-page">
    <view class="balance-card">
      <text class="balance-card__label">当前可用积分</text>
      <view class="balance-card__row">
        <text class="balance-card__value">{{ balanceDisplay }}</text>
        <text class="balance-card__unit">积分</text>
      </view>
      <text class="balance-card__hint">每一笔积分变化均会保留流水记录</text>
    </view>

    <view class="tabs-card surface-card">
      <wd-tabs v-model="activeTab" color="#168e5d" inactive-color="#7b8a82" line-theme="text">
        <wd-tab title="积分明细" name="ledger" />
        <wd-tab title="充值记录" name="recharge" />
        <wd-tab title="消费记录" name="consumption" />
      </wd-tabs>
    </view>

    <view v-if="loading && items.length === 0" class="state-panel">
      <wd-loading color="#168e5d" size="48rpx" />
      <text>正在读取记录</text>
    </view>

    <view v-else-if="loadError && items.length === 0" class="state-panel">
      <wd-icon name="refresh" size="52rpx" color="#8a9991" />
      <text>记录读取失败，请稍后重试</text>
      <wd-button type="primary" variant="soft" size="small" round @click="reload">
        重新加载
      </wd-button>
    </view>

    <view v-else-if="items.length === 0" class="state-panel state-panel--empty">
      <wd-empty icon="list" :tip="emptyTip" />
    </view>

    <view v-else class="transaction-list">
      <view v-for="item in items" :key="item.key" class="transaction-card surface-card">
        <view class="transaction-card__heading">
          <view class="transaction-card__main">
            <text class="transaction-card__title">{{ item.title }}</text>
            <text class="transaction-card__category">{{ item.category }}</text>
          </view>
          <view class="transaction-card__amounts">
            <text :class="['transaction-card__points', `is-${item.pointsTone}`]">
              {{ item.pointsText }}
            </text>
            <text v-if="item.amountText" class="transaction-card__money">
              {{ item.amountText }}
            </text>
          </view>
        </view>

        <view class="transaction-card__meta">
          <text :class="['status-text', `is-${item.statusTone}`]">{{ item.statusText }}</text>
          <text>{{ item.timeText }}</text>
        </view>
        <text v-if="item.remark" class="transaction-card__remark">{{ item.remark }}</text>
        <text class="transaction-card__number">订单号 {{ item.orderNo }}</text>
      </view>

      <wd-loadmore
        :state="loadMoreState"
        loading-text="正在加载更多"
        finished-text="没有更多记录了"
        error-text="加载失败"
        @reload="loadMore"
      />
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import { getErrorMessage } from '@/api/error'
import {
  getCustomerConsumptionOrders,
  getCustomerPointBalance,
  getCustomerPointLedger,
  getCustomerRechargeOrders,
} from '@/api/transactions'
import { useAuthStore } from '@/stores/auth'
import type { PageResult } from '@/types/api'
import type {
  ConsumptionOrderStatus,
  CustomerConsumptionOrder,
  CustomerPointLedger,
  CustomerRechargeOrder,
  PaymentMethod,
  PointLedgerType,
  RechargeOrderStatus,
} from '@/types/transaction'

type TransactionTab = 'ledger' | 'recharge' | 'consumption'
type DisplayTone = 'positive' | 'negative' | 'neutral'
type StatusTone = 'success' | 'warning' | 'muted' | 'danger'
type LoadMoreState = 'loading' | 'error' | 'finished' | undefined

interface DisplayTransaction {
  key: string
  title: string
  category: string
  pointsText: string
  pointsTone: DisplayTone
  amountText: string | null
  statusText: string
  statusTone: StatusTone
  timeText: string
  orderNo: string
  remark: string | null
}

const PAGE_SIZE = 20
const auth = useAuthStore()
const toast = useToast()
const activeTab = ref<TransactionTab>('ledger')
const items = ref<DisplayTransaction[]>([])
const pageNum = ref(0)
const hasNext = ref(false)
const loading = ref(false)
const loadError = ref(false)
let requestVersion = 0

const balanceDisplay = computed(() =>
  auth.user.value ? auth.user.value.availablePoints.toLocaleString('zh-CN') : '--',
)
const emptyTip = computed(() => {
  if (activeTab.value === 'recharge') return '暂无充值记录'
  if (activeTab.value === 'consumption') return '暂无消费记录'
  return '暂无积分明细'
})
const loadMoreState = computed<LoadMoreState>(() => {
  if (loading.value) return 'loading'
  if (loadError.value) return 'error'
  if (!hasNext.value) return 'finished'
  return undefined
})

const ledgerTypeText: Record<PointLedgerType, string> = {
  RECHARGE: '充值入账',
  CONSUME: '消费扣减',
  REFUND: '充值退款',
  ADJUSTMENT: '积分调整',
  REVERSAL: '异常冲正',
}

const rechargeStatus: Record<RechargeOrderStatus, [string, StatusTone]> = {
  CREATED: ['处理中', 'warning'],
  COMPLETED: ['充值完成', 'success'],
  REFUNDED: ['已退款', 'muted'],
  CANCELLED: ['已取消', 'muted'],
}

const consumptionStatus: Record<ConsumptionOrderStatus, [string, StatusTone]> = {
  PENDING_CONFIRM: ['待确认', 'warning'],
  COMPLETED: ['消费完成', 'success'],
  CANCELLED: ['已取消', 'muted'],
  EXPIRED: ['已过期', 'muted'],
  REVERSED: ['已冲正', 'danger'],
}

const paymentMethodText: Record<PaymentMethod, string> = {
  PLATFORM_QR: '平台收款码',
  BANK_TRANSFER: '银行转账',
  OTHER: '其他方式',
}

const formatAmount = (amountCent: number): string => `¥${(amountCent / 100).toFixed(2)}`
const formatDateTime = (value: string | null): string => {
  if (!value) return '--'
  return value.replace('T', ' ').slice(0, 16)
}

const mapLedger = (item: CustomerPointLedger): DisplayTransaction => ({
  key: `ledger-${item.ledgerNo}`,
  title: item.storeName || '平台积分账户',
  category: ledgerTypeText[item.ledgerType],
  pointsText: `${item.deltaPoints > 0 ? '+' : ''}${item.deltaPoints.toLocaleString('zh-CN')} 积分`,
  pointsTone: item.deltaPoints > 0 ? 'positive' : 'negative',
  amountText: null,
  statusText: `余额 ${item.balanceAfter.toLocaleString('zh-CN')}`,
  statusTone: 'success',
  timeText: formatDateTime(item.createTime),
  orderNo: item.businessNo,
  remark: item.remark,
})

const mapRecharge = (item: CustomerRechargeOrder): DisplayTransaction => {
  const [statusText, statusTone] = rechargeStatus[item.orderStatus]
  const completed = item.orderStatus === 'COMPLETED'
  return {
    key: `recharge-${item.orderNo}`,
    title: item.storeName || '合作门店',
    category: `线下充值 · ${paymentMethodText[item.paymentMethod]}`,
    pointsText: `${completed ? '+' : ''}${item.rechargePoints.toLocaleString('zh-CN')} 积分`,
    pointsTone: completed ? 'positive' : 'neutral',
    amountText: formatAmount(item.amountCent),
    statusText,
    statusTone,
    timeText: formatDateTime(item.completedTime || item.createTime),
    orderNo: item.orderNo,
    remark: item.remark,
  }
}

const mapConsumption = (item: CustomerConsumptionOrder): DisplayTransaction => {
  const [statusText, statusTone] = consumptionStatus[item.orderStatus]
  const completed = item.orderStatus === 'COMPLETED'
  return {
    key: `consumption-${item.orderNo}`,
    title: item.storeName || '合作门店',
    category: '门店消费',
    pointsText: `${completed ? '-' : ''}${item.consumePoints.toLocaleString('zh-CN')} 积分`,
    pointsTone: completed ? 'negative' : 'neutral',
    amountText: formatAmount(item.amountCent),
    statusText,
    statusTone,
    timeText: formatDateTime(item.completedTime || item.createTime),
    orderNo: item.orderNo,
    remark: item.remark,
  }
}

const fetchPage = async (
  tab: TransactionTab,
  nextPage: number,
): Promise<PageResult<CustomerPointLedger | CustomerRechargeOrder | CustomerConsumptionOrder>> => {
  if (tab === 'recharge') return getCustomerRechargeOrders(nextPage, PAGE_SIZE)
  if (tab === 'consumption') return getCustomerConsumptionOrders(nextPage, PAGE_SIZE)
  return getCustomerPointLedger(nextPage, PAGE_SIZE)
}

const mapPageItems = (
  tab: TransactionTab,
  page: PageResult<CustomerPointLedger | CustomerRechargeOrder | CustomerConsumptionOrder>,
): DisplayTransaction[] => {
  if (tab === 'recharge') {
    return (page.items as CustomerRechargeOrder[]).map(mapRecharge)
  }
  if (tab === 'consumption') {
    return (page.items as CustomerConsumptionOrder[]).map(mapConsumption)
  }
  return (page.items as CustomerPointLedger[]).map(mapLedger)
}

const refreshBalance = async (version: number): Promise<void> => {
  try {
    const balance = await getCustomerPointBalance()
    if (version !== requestVersion) return
    const user = auth.user.value
    if (user) {
      auth.setUser({ ...user, availablePoints: balance.availablePoints })
    }
  } catch {
    // 账单仍可独立展示；余额稍后可从首页资料接口刷新。
  }
}

const loadPage = async (nextPage: number, replace: boolean): Promise<void> => {
  if (loading.value) return
  const tab = activeTab.value
  const version = requestVersion
  loading.value = true
  loadError.value = false
  try {
    const page = await fetchPage(tab, nextPage)
    if (version !== requestVersion || tab !== activeTab.value) return
    const nextItems = mapPageItems(tab, page)
    items.value = replace ? nextItems : [...items.value, ...nextItems]
    pageNum.value = page.pageNum
    hasNext.value = page.hasNext
  } catch (error) {
    if (version !== requestVersion) return
    loadError.value = true
    if (replace) {
      toast.warning(getErrorMessage(error))
    }
  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

const reload = async (): Promise<void> => {
  requestVersion += 1
  loading.value = false
  items.value = []
  pageNum.value = 0
  hasNext.value = false
  loadError.value = false
  const version = requestVersion
  void refreshBalance(version)
  await loadPage(1, true)
}

const loadMore = async (): Promise<void> => {
  if (loading.value || !hasNext.value) return
  await loadPage(pageNum.value + 1, false)
}

watch(activeTab, () => {
  void reload()
})

onShow(() => {
  if (!auth.isAuthenticated.value) {
    uni.reLaunch({ url: '/pages/auth/login' })
    return
  }
  void reload()
})

onPullDownRefresh(async () => {
  await reload()
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  void loadMore()
})
</script>

<style lang="scss" scoped>
.transactions-page {
  padding-top: 28rpx;
}

.balance-card {
  position: relative;
  overflow: hidden;
  padding: 34rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #0b6042, #1ba46a);
  box-shadow: 0 20rpx 44rpx rgba(14, 117, 76, 0.2);
  color: #ffffff;
}

.balance-card__label,
.balance-card__hint {
  display: block;
}

.balance-card__label {
  color: rgba(255, 255, 255, 0.76);
  font-size: 23rpx;
}

.balance-card__row {
  display: flex;
  align-items: baseline;
  margin: 12rpx 0 14rpx;
}

.balance-card__value {
  font-size: 60rpx;
  font-weight: 700;
  line-height: 1;
}

.balance-card__unit {
  margin-left: 12rpx;
  font-size: 24rpx;
}

.balance-card__hint {
  color: rgba(255, 255, 255, 0.64);
  font-size: 21rpx;
}

.tabs-card {
  overflow: hidden;
  margin-top: 26rpx;
  padding: 0 12rpx;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
  padding: 100rpx 20rpx;
  color: #7c8b83;
  font-size: 24rpx;
}

.state-panel--empty {
  padding-top: 70rpx;
}

.transaction-list {
  margin-top: 24rpx;
}

.transaction-card {
  margin-bottom: 18rpx;
  padding: 27rpx 26rpx 24rpx;
}

.transaction-card__heading,
.transaction-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}

.transaction-card__main {
  flex: 1;
  min-width: 0;
}

.transaction-card__title,
.transaction-card__category,
.transaction-card__points,
.transaction-card__money,
.transaction-card__remark,
.transaction-card__number {
  display: block;
}

.transaction-card__title {
  overflow: hidden;
  color: #24382f;
  font-size: 28rpx;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-card__category {
  margin-top: 8rpx;
  color: #849189;
  font-size: 21rpx;
}

.transaction-card__amounts {
  flex: none;
  text-align: right;
}

.transaction-card__points {
  font-size: 28rpx;
  font-weight: 700;
}

.transaction-card__points.is-positive {
  color: #168e5d;
}

.transaction-card__points.is-negative {
  color: #d05e52;
}

.transaction-card__points.is-neutral {
  color: #53635b;
}

.transaction-card__money {
  margin-top: 6rpx;
  color: #89958f;
  font-size: 20rpx;
}

.transaction-card__meta {
  align-items: center;
  margin-top: 22rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #edf1ef;
  color: #91a098;
  font-size: 20rpx;
}

.status-text {
  font-weight: 600;
}

.status-text.is-success {
  color: #168e5d;
}

.status-text.is-warning {
  color: #bb7a25;
}

.status-text.is-danger {
  color: #c6544b;
}

.status-text.is-muted {
  color: #86938c;
}

.transaction-card__remark {
  margin-top: 16rpx;
  color: #6f7e76;
  font-size: 21rpx;
  line-height: 1.55;
}

.transaction-card__number {
  overflow: hidden;
  margin-top: 13rpx;
  color: #a0aaa5;
  font-size: 18rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
