<template>
  <view class="page-shell bind-phone-page">
    <view class="phone-mark">
      <wd-icon name="phone" size="54rpx" color="#ffffff" />
    </view>
    <text class="page-title">绑定手机号</text>
    <text class="page-description">
      门店将通过手机号找到你的平台积分账户。手机号验证成功后不可在此页面自行更换。
    </text>

    <view class="surface-card bind-form">
      <view class="form-field">
        <text class="field-label">手机号</text>
        <view class="field-control">
          <wd-input
            v-model="phone"
            type="number"
            inputmode="numeric"
            :maxlength="11"
            placeholder="请输入11位手机号"
            clearable
          />
        </view>
      </view>

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
            size="small"
            :disabled="!canRequestCode"
            :loading="requestingCode"
            @click="requestCode"
          >
            {{ requestCodeText }}
          </wd-button>
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
        确认绑定
      </wd-button>
    </view>

    <view class="security-hint">
      <wd-icon name="safe" size="30rpx" color="#168e5d" />
      <text>验证码仅用于确认手机号归属，不会用于自动合并其他积分账户</text>
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import { bindCustomerPhone, requestPhoneVerificationCode } from '@/api/customer'
import { getErrorMessage } from '@/api/error'
import { useAuthStore } from '@/stores/auth'

const PHONE_PATTERN = /^1[3-9]\d{9}$/
const CODE_PATTERN = /^\d{6}$/

const auth = useAuthStore()
const toast = useToast()
const phone = ref('')
const verificationCode = ref('')
const requestingCode = ref(false)
const submitting = ref(false)
const countdownSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const canRequestCode = computed(
  () =>
    PHONE_PATTERN.test(phone.value) &&
    countdownSeconds.value === 0 &&
    !requestingCode.value &&
    !submitting.value,
)
const canSubmit = computed(
  () =>
    PHONE_PATTERN.test(phone.value) &&
    CODE_PATTERN.test(verificationCode.value) &&
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
    if (!PHONE_PATTERN.test(phone.value)) {
      toast.warning('请输入正确的11位手机号')
    }
    return
  }

  requestingCode.value = true
  try {
    const result = await requestPhoneVerificationCode(phone.value)
    startCountdown(result.resendAfterSeconds)
    toast.success('验证码已发送')
  } catch (error) {
    toast.warning(getErrorMessage(error))
  } finally {
    requestingCode.value = false
  }
}

const submit = async (): Promise<void> => {
  if (!canSubmit.value) {
    toast.warning('请填写正确的手机号和6位验证码')
    return
  }

  submitting.value = true
  try {
    const profile = await bindCustomerPhone(phone.value, verificationCode.value)
    auth.setUser(profile)
    toast.success('手机号绑定成功')
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
  if (auth.user.value?.phoneBound) {
    uni.reLaunch({ url: '/pages/index/index' })
  }
})

onBeforeUnmount(clearCountdown)
</script>

<style lang="scss" scoped>
.bind-phone-page {
  padding-top: 56rpx;
}

.phone-mark {
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

.bind-form {
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
