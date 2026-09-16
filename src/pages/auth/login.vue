<template>
  <view class="page-shell login-page">
    <view class="login-mark">积</view>
    <text class="login-title">微信安全登录</text>
    <text class="login-description">
      登录后可查看平台积分，并由你本人确认每一笔门店消费。
    </text>

    <view class="surface-card security-notes">
      <view class="security-note">
        <text class="security-note__index">1</text>
        <text class="security-note__text">微信只用于识别你的平台账户</text>
      </view>
      <view class="security-note">
        <text class="security-note__index">2</text>
        <text class="security-note__text">首次授权可先登录，充值消费前再绑定手机号</text>
      </view>
      <view class="security-note">
        <text class="security-note__index">3</text>
        <text class="security-note__text">积分消费仍需输入消费密码确认</text>
      </view>
    </view>

    <view class="agreement-row">
      <wd-checkbox v-model="agreedToTerms" size="34rpx" />
      <view class="agreement-row__copy" @click="toggleAgreement">
        <text>我已阅读并同意</text>
        <text class="agreement-link" @click.stop="openUserAgreement">《用户协议》</text>
        <text>和</text>
        <text class="agreement-link" @click.stop="openPrivacyPolicy">《隐私政策》</text>
      </view>
    </view>

    <wd-button
      type="primary"
      size="large"
      block
      round
      :loading="authorizing"
      @click="authorize"
    >
      微信授权登录
    </wd-button>
    <text class="login-help">平台不会获取或保存你的微信密码</text>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/uni_modules/wot-ui'
import { getErrorMessage } from '@/api/error'
import { startCustomerLogin } from '@/platform/auth'

const authorizing = ref(false)
const agreedToTerms = ref(false)
const toast = useToast()

const authorize = async (): Promise<void> => {
  if (authorizing.value) {
    return
  }
  if (!agreedToTerms.value) {
    toast.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  authorizing.value = true
  try {
    await startCustomerLogin('/pages/index/index')
  } catch (error) {
    toast.warning(getErrorMessage(error))
    authorizing.value = false
  }
}

const toggleAgreement = (): void => {
  agreedToTerms.value = !agreedToTerms.value
}

const openUserAgreement = (): void => {
  uni.navigateTo({ url: '/pages/legal/user-agreement' })
}

const openPrivacyPolicy = (): void => {
  uni.navigateTo({ url: '/pages/legal/privacy-policy' })
}
</script>

<style lang="scss" scoped>
.login-page {
  padding-top: 88rpx;
  text-align: center;
}

.login-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 116rpx;
  height: 116rpx;
  margin: 0 auto 34rpx;
  border-radius: 34rpx;
  background: var(--app-gradient-brand);
  box-shadow: var(--app-shadow-brand);
  color: var(--app-color-on-brand);
  font-size: 52rpx;
  font-weight: 700;
}

.login-title,
.login-description,
.login-help {
  display: block;
}

.login-title {
  color: var(--app-color-text-strong);
  font-size: 44rpx;
  font-weight: 700;
}

.login-description {
  max-width: 590rpx;
  margin: 20rpx auto 52rpx;
  color: var(--app-color-text-secondary);
  font-size: 26rpx;
  line-height: 1.7;
}

.security-notes {
  margin-bottom: 30rpx;
  padding: 18rpx 28rpx;
  text-align: left;
}

.security-note {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.security-note__index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  margin-right: 20rpx;
  border-radius: 50%;
  background: var(--app-color-primary-50);
  color: var(--app-color-primary);
  font-size: 22rpx;
  font-weight: 700;
}

.security-note__text {
  color: var(--app-color-text);
  font-size: 25rpx;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin: 0 6rpx 30rpx;
  text-align: left;
}

.agreement-row__copy {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.65;
}

.agreement-link {
  color: var(--app-color-primary);
}

.login-help {
  margin-top: 24rpx;
  color: var(--app-color-text-muted);
  font-size: 22rpx;
}
</style>
