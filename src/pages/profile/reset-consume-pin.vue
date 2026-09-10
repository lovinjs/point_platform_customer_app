<template>
  <view class="page-shell reset-pin-page">
    <view class="security-mark">
      <wd-icon name="safe" size="54rpx" color="#ffffff" />
    </view>
    <text class="page-title">重置消费密码</text>
    <text class="page-description">
      验证已绑定手机号 {{ maskedPhone }} 后设置新密码
    </text>

    <view class="surface-card reset-form">
      <view class="form-field">
        <text class="field-label">短信验证码</text>
        <view class="code-row">
          <view class="field-control code-input">
            <wd-input
              v-model="verificationCode"
              type="number"
              inputmode="numeric"
              :maxlength="6"
              placeholder="请输入6位验证码"
              clearable
            />
          </view>
          <wd-button
            type="primary"
            variant="soft"
            :disabled="!canRequestCode"
            :loading="requestingCode"
            @click="requestCode"
          >
            {{ requestCodeText }}
          </wd-button>
        </view>
      </view>

      <view class="form-field">
        <text class="field-label">新消费密码</text>
        <view class="field-control">
          <wd-input
            v-model="newPin"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            show-password
            placeholder="请设置新的6位数字密码"
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
        :disabled="!canSubmit"
        :loading="submitting"
        @click="submit"
      >
        验证并重置
      </wd-button>
    </view>

    <view class="security-hint">
      <wd-icon name="info-circle" size="30rpx" color="#168e5d" />
      <text>重置成功后，当前所有待确认消费订单都会自动取消，需要消费时请让门店重新发起。</text>
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import {
  createConsumePinResetToken,
  requestConsumePinResetVerificationCode,
  resetCustomerConsumePin,
} from '@/api/customer'
import { getErrorMessage } from '@/api/error'
import { useAuthStore } from '@/stores/auth'

const PIN_PATTERN = /^\d{6}$/
const CODE_PATTERN = /^\d{6}$/
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
const verificationCode = ref('')
const newPin = ref('')
const confirmPin = ref('')
const requestingCode = ref(false)
const submitting = ref(false)
const countdownSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const maskedPhone = computed(() => auth.user.value?.maskedPhone || '已绑定手机')
const canRequestCode = computed(
  () => countdownSeconds.value === 0 && !requestingCode.value && !submitting.value,
)
const canSubmit = computed(
  () =>
    CODE_PATTERN.test(verificationCode.value) &&
    PIN_PATTERN.test(newPin.value) &&
    PIN_PATTERN.test(confirmPin.value) &&
    !submitting.value,
)
const requestCodeText = computed(() =>
  countdownSeconds.value > 0 ? `${countdownSeconds.value}秒后重发` : '获取验证码',
)

const clearCountdown = (): void => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startCountdown = (seconds: number): void => {
  clearCountdown()
  const safeSeconds = Math.max(1, Math.floor(seconds))
  const deadline = Date.now() + safeSeconds * 1000
  countdownSeconds.value = safeSeconds
  countdownTimer = setInterval(() => {
    countdownSeconds.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    if (countdownSeconds.value === 0) {
      clearCountdown()
    }
  }, 250)
}

const requestCode = async (): Promise<void> => {
  if (!canRequestCode.value) {
    return
  }
  requestingCode.value = true
  try {
    const result = await requestConsumePinResetVerificationCode()
    startCountdown(result.resendAfterSeconds)
    toast.success('验证码已发送')
  } catch (error) {
    toast.warning(getErrorMessage(error))
  } finally {
    requestingCode.value = false
  }
}

const validateForm = (): boolean => {
  if (!CODE_PATTERN.test(verificationCode.value)) {
    toast.warning('请输入6位短信验证码')
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
  if (newPin.value !== confirmPin.value) {
    toast.warning('两次输入的新密码不一致')
    return false
  }
  return true
}

const submit = async (): Promise<void> => {
  if (submitting.value || !validateForm()) {
    return
  }
  submitting.value = true
  try {
    const { resetToken } = await createConsumePinResetToken(verificationCode.value)
    const nextStatus = await resetCustomerConsumePin(resetToken, newPin.value)
    const user = auth.user.value
    if (user) {
      auth.setUser({ ...user, consumePinConfigured: nextStatus.configured })
    }
    toast.success('消费密码已重置')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 700)
  } catch (error) {
    toast.warning(getErrorMessage(error))
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
  if (!auth.user.value.consumePinConfigured) {
    uni.redirectTo({ url: '/pages/profile/consume-pin' })
  }
})

onBeforeUnmount(clearCountdown)
</script>

<style lang="scss" scoped>
.reset-pin-page {
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
.field-label {
  display: block;
}

.page-title {
  color: #18231e;
  font-size: 42rpx;
  font-weight: 700;
  text-align: center;
}

.page-description {
  margin: 18rpx auto 42rpx;
  color: #75847c;
  font-size: 25rpx;
  line-height: 1.7;
  text-align: center;
}

.reset-form {
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

.code-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.code-input {
  flex: 1;
  min-width: 0;
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
