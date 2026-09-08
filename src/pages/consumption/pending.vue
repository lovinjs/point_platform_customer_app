<template>
  <view class="page-shell consumption-page">
    <view v-if="lastResult" class="success-panel">
      <view class="success-mark">
        <wd-icon name="check" size="64rpx" color="#ffffff" />
      </view>
      <text class="success-title">消费成功</text>
      <text class="success-description">积分已经扣减，本次消费已归属到对应门店。</text>

      <view class="surface-card receipt-card">
        <view class="receipt-row">
          <text>消费门店</text>
          <text class="receipt-value">{{ lastResult.storeName }}</text>
        </view>
        <view class="receipt-row">
          <text>消费积分</text>
          <text class="receipt-value receipt-value--accent">
            {{ formatPoints(lastResult.consumePoints) }} 积分
          </text>
        </view>
        <view class="receipt-row">
          <text>消费金额</text>
          <text class="receipt-value">{{ formatAmount(lastResult.amountCent) }}</text>
        </view>
        <view class="receipt-row">
          <text>剩余积分</text>
          <text class="receipt-value">{{ formatPoints(lastResult.availablePoints) }}</text>
        </view>
        <view class="receipt-row receipt-row--last">
          <text>订单编号</text>
          <text class="receipt-value receipt-value--number">{{ lastResult.orderNo }}</text>
        </view>
      </view>

      <wd-button type="primary" size="large" block round @click="backToHome">
        返回首页
      </wd-button>
    </view>

    <template v-else-if="pendingOrder">
      <view class="order-heading">
        <view>
          <text class="eyebrow">请本人核对</text>
          <text class="page-title">确认本次消费</text>
        </view>
        <wd-tag type="warning" variant="light" round>等待确认</wd-tag>
      </view>

      <view class="amount-card">
        <text class="amount-card__store">{{ pendingOrder.storeName }}</text>
        <view class="amount-card__value-row">
          <text class="amount-card__symbol">¥</text>
          <text class="amount-card__value">{{ amountNumber }}</text>
        </view>
        <text class="amount-card__points">
          将扣除 {{ formatPoints(pendingOrder.consumePoints) }} 平台积分
        </text>
      </view>

      <view class="surface-card detail-card">
        <view class="detail-row">
          <text>剩余确认时间</text>
          <text class="detail-value detail-value--countdown">{{ remainingText }}</text>
        </view>
        <view v-if="pendingOrder.remark" class="detail-row">
          <text>门店备注</text>
          <text class="detail-value">{{ pendingOrder.remark }}</text>
        </view>
        <view class="detail-row detail-row--last">
          <text>订单编号</text>
          <text class="detail-value detail-value--number">{{ pendingOrder.orderNo }}</text>
        </view>
      </view>

      <view class="surface-card confirm-card">
        <text class="field-label">消费密码</text>
        <view class="pin-control">
          <wd-input
            v-model="consumePin"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            show-password
            placeholder="请输入6位消费密码"
            clearable
          />
        </view>
        <text class="confirm-hint">确认后将立即扣减积分，消费完成后不支持退款。</text>
        <wd-button
          type="primary"
          size="large"
          block
          round
          :disabled="expired || confirming"
          :loading="confirming"
          @click="submitConfirmation"
        >
          确认消费
        </wd-button>
      </view>
    </template>

    <view v-else class="waiting-panel">
      <view class="waiting-mark">
        <wd-loading v-if="loading" color="#168e5d" size="52rpx" />
        <wd-icon v-else name="time-line" size="54rpx" color="#168e5d" />
      </view>
      <text class="waiting-title">{{ loading ? '正在查询订单' : '等待门店发起消费' }}</text>
      <text class="waiting-description">
        请让店员按你的手机号创建消费订单。本页面会自动刷新，订单出现后无需重新进入。
      </text>
      <wd-button
        type="primary"
        variant="soft"
        round
        :loading="loading"
        @click="manualRefresh"
      >
        手动刷新
      </wd-button>
    </view>

    <view v-if="!lastResult" class="security-hint">
      <wd-icon name="safe" size="30rpx" color="#168e5d" />
      <text>确认前请核对门店和金额。消费密码只应在自己的手机上输入，不要口头告知店员。</text>
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onHide, onPullDownRefresh, onShow, onUnload } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import { ApiError, getErrorMessage } from '@/api/error'
import { confirmConsumption, getPendingConsumption } from '@/api/consumption'
import { useAuthStore } from '@/stores/auth'
import type {
  ConsumptionConfirmationResult,
  CustomerPendingConsumption,
} from '@/types/consumption'

const POLL_INTERVAL_MS = 3000
const PIN_PATTERN = /^\d{6}$/
const REFRESH_AFTER_ERROR_CODES = new Set([30023, 30053, 30054, 30055])

const auth = useAuthStore()
const toast = useToast()
const pendingOrder = ref<CustomerPendingConsumption | null>(null)
const lastResult = ref<ConsumptionConfirmationResult | null>(null)
const consumePin = ref('')
const loading = ref(false)
const confirming = ref(false)
const nowTimestamp = ref(Date.now())
let pollTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

const parseLocalDateTime = (value: string): number => {
  const normalized = value.replace('T', ' ').replace(/-/g, '/')
  const timestamp = new Date(normalized).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

const remainingSeconds = computed(() => {
  if (!pendingOrder.value) {
    return 0
  }
  const expiresAt = parseLocalDateTime(pendingOrder.value.expiresTime)
  return Math.max(0, Math.ceil((expiresAt - nowTimestamp.value) / 1000))
})
const expired = computed(() => remainingSeconds.value <= 0)
const remainingText = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const amountNumber = computed(() =>
  pendingOrder.value ? (pendingOrder.value.amountCent / 100).toFixed(2) : '0.00',
)

const formatAmount = (amountCent: number): string => `¥${(amountCent / 100).toFixed(2)}`
const formatPoints = (points: number): string => points.toLocaleString('zh-CN')

const stopTimers = (): void => {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (clockTimer !== null) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}

const refreshPending = async (silent: boolean): Promise<void> => {
  if (loading.value || confirming.value || lastResult.value) {
    return
  }
  loading.value = true
  try {
    const nextOrder = await getPendingConsumption()
    if (nextOrder?.orderNo !== pendingOrder.value?.orderNo) {
      consumePin.value = ''
    }
    pendingOrder.value = nextOrder
    nowTimestamp.value = Date.now()
  } catch (error) {
    if (!silent) {
      toast.warning(getErrorMessage(error))
    }
  } finally {
    loading.value = false
  }
}

const startTimers = (): void => {
  stopTimers()
  nowTimestamp.value = Date.now()
  pollTimer = setInterval(() => {
    void refreshPending(true)
  }, POLL_INTERVAL_MS)
  clockTimer = setInterval(() => {
    nowTimestamp.value = Date.now()
    if (pendingOrder.value && expired.value) {
      void refreshPending(true)
    }
  }, 1000)
}

const manualRefresh = async (): Promise<void> => {
  await refreshPending(false)
}

const submitConfirmation = async (): Promise<void> => {
  const order = pendingOrder.value
  if (!order || confirming.value) {
    return
  }
  if (expired.value) {
    toast.warning('订单已过期，请让门店重新发起')
    await refreshPending(true)
    return
  }
  if (!PIN_PATTERN.test(consumePin.value)) {
    toast.warning('请输入6位消费密码')
    return
  }

  let shouldRefresh = false
  confirming.value = true
  try {
    const result = await confirmConsumption(order.orderNo, consumePin.value)
    lastResult.value = result
    pendingOrder.value = null
    consumePin.value = ''
    const user = auth.user.value
    if (user) {
      auth.setUser({ ...user, availablePoints: result.availablePoints })
    }
    stopTimers()
    toast.success('消费确认成功')
  } catch (error) {
    consumePin.value = ''
    toast.warning(getErrorMessage(error))
    if (error instanceof ApiError && REFRESH_AFTER_ERROR_CODES.has(error.code ?? 0)) {
      shouldRefresh = true
    }
  } finally {
    confirming.value = false
  }

  if (shouldRefresh) {
    await refreshPending(true)
  }
}

const backToHome = (): void => {
  uni.reLaunch({ url: '/pages/index/index' })
}

onShow(() => {
  if (!auth.isAuthenticated.value) {
    uni.reLaunch({ url: '/pages/auth/login' })
    return
  }
  if (!auth.user.value?.phoneBound) {
    uni.redirectTo({ url: '/pages/profile/bind-phone' })
    return
  }
  if (!auth.user.value.consumePinConfigured) {
    uni.redirectTo({ url: '/pages/profile/consume-pin' })
    return
  }
  if (!lastResult.value) {
    void refreshPending(false)
    startTimers()
  }
})

onPullDownRefresh(async () => {
  await refreshPending(false)
  uni.stopPullDownRefresh()
})

onHide(stopTimers)
onUnload(stopTimers)
</script>

<style lang="scss" scoped>
.consumption-page {
  padding-top: 46rpx;
}

.order-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin: 0 4rpx 30rpx;
}

.eyebrow,
.page-title,
.amount-card__store,
.amount-card__points,
.field-label,
.confirm-hint,
.waiting-title,
.waiting-description,
.success-title,
.success-description {
  display: block;
}

.eyebrow {
  margin-bottom: 7rpx;
  color: #168e5d;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.page-title {
  color: #18231e;
  font-size: 42rpx;
  font-weight: 700;
}

.amount-card {
  padding: 42rpx 32rpx 36rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #0b6042, #1ba46a);
  box-shadow: 0 22rpx 48rpx rgba(14, 117, 76, 0.22);
  color: #ffffff;
  text-align: center;
}

.amount-card__store {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-size: 27rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-card__value-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin: 20rpx 0 14rpx;
}

.amount-card__symbol {
  margin-right: 8rpx;
  font-size: 35rpx;
  font-weight: 600;
}

.amount-card__value {
  font-size: 72rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
  line-height: 1;
}

.amount-card__points {
  color: rgba(255, 255, 255, 0.72);
  font-size: 23rpx;
}

.detail-card,
.confirm-card,
.receipt-card {
  margin-top: 26rpx;
  padding: 8rpx 28rpx;
}

.detail-row,
.receipt-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #edf1ef;
  color: #7b8a82;
  font-size: 23rpx;
}

.detail-row--last,
.receipt-row--last {
  border-bottom: 0;
}

.detail-value,
.receipt-value {
  flex: 1;
  color: #2f4138;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.detail-value--countdown,
.receipt-value--accent {
  color: #168e5d;
  font-weight: 700;
}

.detail-value--number,
.receipt-value--number {
  font-size: 19rpx;
}

.confirm-card {
  padding: 30rpx 28rpx;
}

.field-label {
  margin: 0 4rpx 12rpx;
  color: #35463e;
  font-size: 25rpx;
  font-weight: 600;
}

.pin-control {
  overflow: hidden;
  border: 1rpx solid #dfe9e4;
  border-radius: 20rpx;
  background: #f8fbf9;
}

.confirm-hint {
  margin: 18rpx 4rpx 28rpx;
  color: #947546;
  font-size: 21rpx;
  line-height: 1.6;
}

.waiting-panel,
.success-panel {
  padding-top: 52rpx;
  text-align: center;
}

.waiting-mark,
.success-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto 30rpx;
  border-radius: 36rpx;
  background: #e8f7ef;
}

.success-mark {
  border-radius: 50%;
  background: linear-gradient(135deg, #0c6545, #26aa70);
  box-shadow: 0 20rpx 44rpx rgba(16, 135, 85, 0.22);
}

.waiting-title,
.success-title {
  color: #18231e;
  font-size: 38rpx;
  font-weight: 700;
}

.waiting-description,
.success-description {
  max-width: 620rpx;
  margin: 18rpx auto 34rpx;
  color: #75847c;
  font-size: 24rpx;
  line-height: 1.7;
}

.receipt-card {
  margin-bottom: 30rpx;
  text-align: left;
}

.security-hint {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin: 30rpx 12rpx 0;
  color: #718078;
  font-size: 22rpx;
  line-height: 1.6;
}

.security-hint text {
  flex: 1;
}

:deep(.wd-input) {
  padding: 24rpx 22rpx;
  background: transparent;
}
</style>
