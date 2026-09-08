<template>
  <view class="page-shell consume-pin-page">
    <view class="security-mark">
      <wd-icon name="safe" size="54rpx" color="#ffffff" />
    </view>
    <text class="page-title">{{ pageTitle }}</text>
    <text class="page-description">{{ pageDescription }}</text>

    <view v-if="locked" class="lock-notice surface-card">
      <wd-icon name="info-circle" size="34rpx" color="#b26b10" />
      <view class="lock-notice__copy">
        <text class="lock-notice__title">消费密码已临时锁定</text>
        <text class="lock-notice__description">{{ lockedUntilText }}</text>
      </view>
    </view>

    <view class="surface-card pin-form">
      <view v-if="configured" class="form-field">
        <text class="field-label">当前消费密码</text>
        <view class="field-control">
          <wd-input
            v-model="currentPin"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            show-password
            placeholder="请输入当前6位密码"
            clearable
          />
        </view>
      </view>

      <view class="form-field">
        <text class="field-label">{{ configured ? '新消费密码' : '消费密码' }}</text>
        <view class="field-control">
          <wd-input
            v-model="newPin"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            show-password
            placeholder="请设置6位数字密码"
            clearable
          />
        </view>
      </view>

      <view class="form-field">
        <text class="field-label">确认新密码</text>
        <view class="field-control">
          <wd-input
            v-model="confirmPin"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            show-password
            placeholder="请再次输入新密码"
            clearable
          />
        </view>
      </view>

      <wd-button
        type="primary"
        size="large"
        block
        round
        :disabled="loading || locked"
        :loading="submitting"
        @click="submit"
      >
        {{ configured ? '确认修改' : '确认设置' }}
      </wd-button>

      <text v-if="configured && updatedTimeText" class="updated-time">
        上次修改：{{ updatedTimeText }}
      </text>
    </view>

    <view class="security-hint">
      <wd-icon name="safe" size="30rpx" color="#168e5d" />
      <text>请勿使用连续或重复数字；门店工作人员不会向你索要消费密码，请只在本人页面输入。</text>
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import {
  changeCustomerConsumePin,
  getConsumePinStatus,
  setCustomerConsumePin,
} from '@/api/customer'
import { ApiError, getErrorMessage } from '@/api/error'
import { useAuthStore } from '@/stores/auth'
import type { ConsumePinStatus } from '@/types/auth'

const PIN_PATTERN = /^\d{6}$/
const WEAK_PINS = new Set([
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '012345',
  '123456',
  '234567',
  '345678',
  '456789',
  '987654',
  '876543',
  '765432',
  '654321',
  '543210',
])

const auth = useAuthStore()
const toast = useToast()
const status = ref<ConsumePinStatus | null>(null)
const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const loading = ref(false)
const submitting = ref(false)

const configured = computed(
  () => status.value?.configured ?? auth.user.value?.consumePinConfigured ?? false,
)
const locked = computed(() => status.value?.locked ?? false)
const pageTitle = computed(() => (configured.value ? '修改消费密码' : '设置消费密码'))
const pageDescription = computed(() =>
  configured.value
    ? '修改时需要验证当前密码，连续输错会被临时锁定。'
    : '消费密码用于确认门店发起的消费订单，请设置本人容易记住的6位数字。',
)

const formatLocalDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return ''
  }
  return value.replace('T', ' ').slice(0, 16)
}

const lockedUntilText = computed(() => {
  const value = formatLocalDateTime(status.value?.lockedUntil)
  return value ? `预计 ${value} 后可再次尝试` : '请稍后再试'
})
const updatedTimeText = computed(() => formatLocalDateTime(status.value?.pinUpdatedTime))

const syncConfiguredState = (nextStatus: ConsumePinStatus): void => {
  const user = auth.user.value
  if (user) {
    auth.setUser({ ...user, consumePinConfigured: nextStatus.configured })
  }
}

const loadStatus = async (): Promise<void> => {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    const nextStatus = await getConsumePinStatus()
    status.value = nextStatus
    syncConfiguredState(nextStatus)
  } catch (error) {
    toast.warning(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  if (configured.value && !PIN_PATTERN.test(currentPin.value)) {
    toast.warning('请输入当前6位消费密码')
    return false
  }
  if (!PIN_PATTERN.test(newPin.value)) {
    toast.warning('新消费密码必须为6位数字')
    return false
  }
  if (WEAK_PINS.has(newPin.value)) {
    toast.warning('请勿使用连续或重复数字作为消费密码')
    return false
  }
  if (configured.value && currentPin.value === newPin.value) {
    toast.warning('新消费密码不能与当前密码相同')
    return false
  }
  if (newPin.value !== confirmPin.value) {
    toast.warning('两次输入的新密码不一致')
    return false
  }
  return true
}

const submit = async (): Promise<void> => {
  if (submitting.value || loading.value || locked.value) {
    return
  }
  if (!validateForm()) {
    return
  }

  submitting.value = true
  try {
    const wasConfigured = configured.value
    const nextStatus = wasConfigured
      ? await changeCustomerConsumePin(currentPin.value, newPin.value)
      : await setCustomerConsumePin(newPin.value)
    status.value = nextStatus
    syncConfiguredState(nextStatus)
    currentPin.value = ''
    newPin.value = ''
    confirmPin.value = ''
    toast.success(wasConfigured ? '消费密码修改成功' : '消费密码设置成功')
    setTimeout(() => {
      uni.navigateBack({
        fail: () => uni.reLaunch({ url: '/pages/index/index' }),
      })
    }, 700)
  } catch (error) {
    toast.warning(getErrorMessage(error))
    if (error instanceof ApiError && error.code === 30031) {
      await loadStatus()
    }
  } finally {
    submitting.value = false
  }
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
  void loadStatus()
})
</script>

<style lang="scss" scoped>
.consume-pin-page {
  padding-top: 56rpx;
}

.security-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  height: 108rpx;
  margin: 0 auto 30rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #0c6545, #26aa70);
  box-shadow: 0 20rpx 44rpx rgba(16, 135, 85, 0.22);
}

.page-title,
.page-description,
.field-label,
.updated-time,
.lock-notice__title,
.lock-notice__description {
  display: block;
}

.page-title {
  color: #18231e;
  font-size: 42rpx;
  font-weight: 700;
  text-align: center;
}

.page-description {
  margin: 18rpx auto 38rpx;
  color: #75847c;
  font-size: 25rpx;
  line-height: 1.7;
  text-align: center;
}

.lock-notice {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-color: #f2dfb8;
  background: #fffaf0;
}

.lock-notice__copy {
  flex: 1;
}

.lock-notice__title {
  color: #6e4c1c;
  font-size: 25rpx;
  font-weight: 600;
}

.lock-notice__description {
  margin-top: 6rpx;
  color: #947546;
  font-size: 22rpx;
}

.pin-form {
  padding: 34rpx 28rpx 30rpx;
}

.form-field {
  margin-bottom: 30rpx;
}

.field-label {
  margin: 0 4rpx 12rpx;
  color: #35463e;
  font-size: 25rpx;
  font-weight: 600;
}

.field-control {
  overflow: hidden;
  border: 1rpx solid #dfe9e4;
  border-radius: 20rpx;
  background: #f8fbf9;
}

.updated-time {
  margin-top: 22rpx;
  color: #8b9891;
  font-size: 21rpx;
  text-align: center;
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
