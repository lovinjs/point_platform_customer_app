<template>
  <view class="page-shell home-page">
    <view class="welcome-row">
      <view class="account-summary">
        <view class="avatar-shell">
          <wd-avatar
            :src="avatarSource"
            :text="avatarFallbackText"
            size="88rpx"
            bg-color="#dff4e9"
            color="#0f7e50"
            @error="handleAvatarError"
          />
        </view>
        <view class="account-summary__copy">
          <text class="eyebrow">{{ appConfig.title }}</text>
          <text class="welcome-title">{{ welcomeTitle }}</text>
        </view>
      </view>
      <wd-tag type="primary" variant="light" round>多门店通用</wd-tag>
    </view>

    <view class="balance-card">
      <view class="balance-card__glow" />
      <text class="balance-label">可用积分</text>
      <view class="balance-row">
        <text class="balance-value">{{ balanceDisplay }}</text>
        <text class="balance-unit">积分</text>
      </view>
      <view class="balance-footer">
        <text>1积分 = 1元</text>
        <text>{{ sessionHint }}</text>
      </view>
    </view>

    <text class="section-title">核心能力</text>
    <view class="surface-card capability-list">
      <view class="capability-item">
        <view class="capability-index">01</view>
        <view class="capability-copy">
          <text class="capability-title">全平台积分账户</text>
          <text class="capability-description">任意合作门店充值，积分统一管理</text>
        </view>
      </view>
      <view class="capability-divider" />
      <view class="capability-item">
        <view class="capability-index">02</view>
        <view class="capability-copy">
          <text class="capability-title">消费由本人确认</text>
          <text class="capability-description">待消费订单须由消费者输入密码确认</text>
        </view>
      </view>
    </view>

    <view v-if="!auth.isAuthenticated.value" class="login-panel surface-card">
      <text class="login-panel__title">登录后查看积分</text>
      <text class="login-panel__description">
        微信授权接通后，可查询余额、待消费订单和积分记录。
      </text>
      <wd-button type="primary" size="large" block round @click="goToLogin">
        微信登录
      </wd-button>
    </view>

    <view
      v-else-if="auth.user.value && !auth.user.value.phoneBound"
      class="account-notice surface-card"
    >
      <view class="account-notice__badge">待完善</view>
      <view class="account-notice__copy">
        <text class="account-notice__title">手机号尚未绑定</text>
        <text class="account-notice__description">
          当前可以查看账户；充值、消费和找回消费密码将在绑定手机号后开放。
        </text>
        <wd-button
          type="warning"
          variant="soft"
          size="small"
          round
          custom-class="account-notice__action"
          @click="goToBindPhone"
        >
          立即绑定
        </wd-button>
      </view>
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCustomerProfile } from '@/api/customer'
import { appConfig } from '@/config/app'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const refreshing = ref(false)
const avatarLoadFailed = ref(false)

const welcomeTitle = computed(() => auth.user.value?.nickname || '欢迎使用平台积分')
const avatarSource = computed(() => {
  if (avatarLoadFailed.value) {
    return ''
  }
  return auth.user.value?.avatarUrl?.trim() ?? ''
})
const avatarFallbackText = computed(() => {
  const nickname = auth.user.value?.nickname?.trim()
  return nickname ? Array.from(nickname)[0] : '积'
})
const balanceDisplay = computed(() =>
  auth.user.value ? auth.user.value.availablePoints.toLocaleString('zh-CN') : '--',
)
const sessionHint = computed(() =>
  auth.isAuthenticated.value ? '账户已登录' : '当前未登录',
)

const goToLogin = (): void => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const goToBindPhone = (): void => {
  uni.navigateTo({ url: '/pages/profile/bind-phone' })
}

const handleAvatarError = (): void => {
  avatarLoadFailed.value = true
}

const refreshProfile = async (): Promise<void> => {
  if (!auth.isAuthenticated.value || refreshing.value) {
    return
  }
  refreshing.value = true
  try {
    auth.setUser(await getCustomerProfile())
  } catch {
    // 网络错误时继续显示最近一次成功读取的数据；401 会由请求层清除登录态。
  } finally {
    refreshing.value = false
  }
}

onShow(() => {
  void refreshProfile()
})

watch(
  () => auth.user.value?.avatarUrl,
  () => {
    avatarLoadFailed.value = false
  },
)
</script>

<style lang="scss" scoped>
.home-page {
  overflow: hidden;
}

.welcome-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin: 8rpx 4rpx 28rpx;
}

.account-summary {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.avatar-shell {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  margin-right: 20rpx;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
  background: #dff4e9;
  box-shadow: 0 10rpx 28rpx rgba(17, 77, 55, 0.14);
}

.account-summary__copy {
  min-width: 0;
}

.eyebrow,
.welcome-title,
.balance-label,
.balance-value,
.balance-unit,
.capability-title,
.capability-description,
.login-panel__title,
.login-panel__description {
  display: block;
}

.eyebrow {
  margin-bottom: 8rpx;
  color: #73837b;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.welcome-title {
  overflow: hidden;
  color: #18231e;
  font-size: 40rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.balance-card {
  position: relative;
  overflow: hidden;
  padding: 44rpx 40rpx 34rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #0c5f42 0%, #169b62 58%, #46b783 100%);
  box-shadow: 0 24rpx 52rpx rgba(14, 117, 76, 0.24);
  color: #ffffff;
}

.balance-card__glow {
  position: absolute;
  top: -110rpx;
  right: -80rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.balance-label {
  position: relative;
  color: rgba(255, 255, 255, 0.78);
  font-size: 26rpx;
}

.balance-row {
  position: relative;
  display: flex;
  align-items: baseline;
  margin: 14rpx 0 42rpx;
}

.balance-value {
  font-size: 76rpx;
  font-weight: 700;
  letter-spacing: -2rpx;
  line-height: 1;
}

.balance-unit {
  margin-left: 14rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 26rpx;
}

.balance-footer {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.75);
  font-size: 22rpx;
}

.capability-list {
  padding: 8rpx 28rpx;
}

.capability-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
}

.capability-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-right: 24rpx;
  border-radius: 22rpx;
  background: #eef8f3;
  color: #148557;
  font-size: 22rpx;
  font-weight: 700;
}

.capability-copy {
  flex: 1;
}

.capability-title {
  margin-bottom: 8rpx;
  color: #24382f;
  font-size: 28rpx;
  font-weight: 600;
}

.capability-description {
  color: #829087;
  font-size: 23rpx;
  line-height: 1.5;
}

.capability-divider {
  height: 1rpx;
  margin-left: 96rpx;
  background: #edf1ef;
}

.login-panel {
  margin-top: 28rpx;
  padding: 32rpx 28rpx;
}

.login-panel__title {
  color: #24382f;
  font-size: 30rpx;
  font-weight: 600;
}

.login-panel__description {
  margin: 12rpx 0 28rpx;
  color: #829087;
  font-size: 24rpx;
  line-height: 1.6;
}

.account-notice {
  display: flex;
  align-items: flex-start;
  margin-top: 28rpx;
  padding: 28rpx;
  border: 1rpx solid #f2dfb8;
  background: #fffaf0;
}

.account-notice__badge {
  flex: none;
  margin-right: 20rpx;
  padding: 7rpx 14rpx;
  border-radius: 14rpx;
  background: #fff0cf;
  color: #a86913;
  font-size: 21rpx;
  font-weight: 600;
}

.account-notice__copy {
  flex: 1;
}

.account-notice__title,
.account-notice__description {
  display: block;
}

.account-notice__title {
  color: #5e451f;
  font-size: 27rpx;
  font-weight: 600;
}

.account-notice__description {
  margin-top: 8rpx;
  color: #8d744d;
  font-size: 23rpx;
  line-height: 1.6;
}

:deep(.account-notice__action) {
  margin-top: 22rpx;
}
</style>
