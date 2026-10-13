<template>
  <view class="page-shell home-page">
    <release-notice />
    <view class="welcome-row">
      <view class="account-summary">
        <view class="avatar-shell">
          <wd-avatar
            :src="avatarSource"
            :text="avatarFallbackText"
            size="88rpx"
            :bg-color="themeColors.primarySoft"
            :color="themeColors.primary"
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

    <view v-else class="security-card surface-card">
      <view class="security-card__icon">
        <wd-icon name="safe" size="38rpx" :color="themeColors.primary" />
      </view>
      <view class="security-card__copy">
        <text class="security-card__title">消费密码</text>
        <text class="security-card__description">
          {{ consumePinDescription }}
        </text>
      </view>
      <wd-button
        type="primary"
        variant="soft"
        size="small"
        round
        @click="goToConsumePin"
      >
        {{ consumePinActionText }}
      </wd-button>
    </view>

    <view
      v-if="auth.isAuthenticated.value && auth.user.value?.phoneBound && auth.user.value.consumePinConfigured"
      class="consumption-card surface-card"
    >
      <view class="consumption-card__copy">
        <text class="consumption-card__eyebrow">线下门店消费</text>
        <text class="consumption-card__title">待确认消费</text>
        <text class="consumption-card__description">
          门店发起订单后，由你本人核对门店和金额并输入密码确认。
        </text>
      </view>
      <wd-button type="primary" size="small" round @click="goToPendingConsumption">
        查看订单
      </wd-button>
    </view>

    <view
      v-if="auth.isAuthenticated.value"
      class="transactions-card surface-card"
      @click="goToTransactions"
    >
      <view class="transactions-card__icon">
        <wd-icon name="list" size="38rpx" :color="themeColors.primary" />
      </view>
      <view class="transactions-card__copy">
        <text class="transactions-card__title">账单记录</text>
        <text class="transactions-card__description">查看积分明细、充值和消费订单</text>
      </view>
      <wd-icon name="right" size="30rpx" :color="themeColors.iconMuted" />
    </view>

    <text class="section-title support-section-title">帮助与服务</text>
    <view class="support-card surface-card">
      <view class="support-row" @click="goToHelpCenter">
        <view class="support-row__icon">
          <wd-icon name="question-circle" size="35rpx" :color="themeColors.primary" />
        </view>
        <text class="support-row__title">帮助中心</text>
        <wd-icon name="right" size="28rpx" :color="themeColors.iconMuted" />
      </view>
      <view class="support-row__divider" />
      <view class="support-row" @click="goToUserAgreement">
        <view class="support-row__icon">
          <wd-icon name="file" size="35rpx" :color="themeColors.primary" />
        </view>
        <text class="support-row__title">用户协议</text>
        <wd-icon name="right" size="28rpx" :color="themeColors.iconMuted" />
      </view>
      <view class="support-row__divider" />
      <view class="support-row" @click="goToPrivacyPolicy">
        <view class="support-row__icon">
          <wd-icon name="safe" size="35rpx" :color="themeColors.primary" />
        </view>
        <text class="support-row__title">隐私政策</text>
        <wd-icon name="right" size="28rpx" :color="themeColors.iconMuted" />
      </view>
    </view>

    <site-footer />
    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCustomerProfile } from '@/api/customer'
import ReleaseNotice from '@/components/release-notice.vue'
import SiteFooter from '@/components/site-footer.vue'
import { appConfig } from '@/config/app'
import { themeColors } from '@/config/theme'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const refreshing = ref(false)
const avatarLoadFailed = ref(false)

const welcomeTitle = computed(() => auth.user.value?.nickname || '欢迎使用' + appConfig.title)
const avatarSource = computed(() => {
  if (avatarLoadFailed.value) {
    return ''
  }
  return auth.user.value?.avatarUrl?.trim() ?? ''
})
const avatarFallbackText = computed(() => {
  const nickname = auth.user.value?.nickname?.trim()
  return nickname ? Array.from(nickname)[0] : '穹'
})
const balanceDisplay = computed(() =>
  auth.user.value ? auth.user.value.availablePoints.toLocaleString('zh-CN') : '--',
)
const sessionHint = computed(() =>
  auth.isAuthenticated.value ? '账户已登录' : '当前未登录',
)
const consumePinDescription = computed(() =>
  auth.user.value?.consumePinConfigured
    ? '已设置，消费时由本人输入确认'
    : '尚未设置，设置后才能确认消费',
)
const consumePinActionText = computed(() =>
  auth.user.value?.consumePinConfigured ? '修改' : '设置',
)

const goToLogin = (): void => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const goToBindPhone = (): void => {
  uni.navigateTo({ url: '/pages/profile/bind-phone' })
}

const goToConsumePin = (): void => {
  uni.navigateTo({ url: '/pages/profile/consume-pin' })
}

const goToPendingConsumption = (): void => {
  uni.navigateTo({ url: '/pages/consumption/pending' })
}

const goToTransactions = (): void => {
  uni.navigateTo({ url: '/pages/transactions/index' })
}

const goToHelpCenter = (): void => {
  uni.navigateTo({ url: '/pages/help/index' })
}

const goToUserAgreement = (): void => {
  uni.navigateTo({ url: '/pages/legal/user-agreement' })
}

const goToPrivacyPolicy = (): void => {
  uni.navigateTo({ url: '/pages/legal/privacy-policy' })
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
  border: 4rpx solid var(--app-color-surface);
  border-radius: 50%;
  background: var(--app-color-primary-100);
  box-shadow: var(--app-shadow-avatar);
}

.account-summary__copy {
  min-width: 0;
}

.eyebrow,
.welcome-title,
.balance-label,
.balance-value,
.balance-unit,
.login-panel__title,
.login-panel__description {
  display: block;
}

.eyebrow {
  margin-bottom: 8rpx;
  color: var(--app-color-text-secondary);
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.welcome-title {
  overflow: hidden;
  color: var(--app-color-text-strong);
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
  background: var(--app-gradient-brand);
  box-shadow: var(--app-shadow-brand);
  color: var(--app-color-on-brand);
}

.balance-card__glow {
  position: absolute;
  top: -110rpx;
  right: -80rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: var(--app-color-on-brand-surface);
}

.balance-label {
  position: relative;
  color: var(--app-color-on-brand-strong);
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
  color: var(--app-color-on-brand-strong);
  font-size: 26rpx;
}

.balance-footer {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding-top: 24rpx;
  border-top: 1rpx solid var(--app-color-on-brand-border);
  color: var(--app-color-on-brand-muted);
  font-size: 22rpx;
}

.login-panel {
  margin-top: 28rpx;
  padding: 32rpx 28rpx;
}

.login-panel__title {
  color: var(--app-color-text-strong);
  font-size: 30rpx;
  font-weight: 600;
}

.login-panel__description {
  margin: 12rpx 0 28rpx;
  color: var(--app-color-text-muted);
  font-size: 24rpx;
  line-height: 1.6;
}

.account-notice {
  display: flex;
  align-items: flex-start;
  margin-top: 28rpx;
  padding: 28rpx;
  border: 1rpx solid var(--app-color-warning-border);
  background: var(--app-color-warning-soft);
}

.account-notice__badge {
  flex: none;
  margin-right: 20rpx;
  padding: 7rpx 14rpx;
  border-radius: 14rpx;
  background: var(--app-color-warning-badge);
  color: var(--app-color-warning-text);
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

.security-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 28rpx;
  padding: 26rpx 24rpx;
}

.security-card__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: var(--app-color-primary-50);
}

.security-card__copy {
  flex: 1;
  min-width: 0;
}

.security-card__title,
.security-card__description {
  display: block;
}

.transactions-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 28rpx;
  padding: 26rpx 24rpx;
}

.transactions-card__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: var(--app-color-primary-50);
}

.transactions-card__copy {
  flex: 1;
  min-width: 0;
}

.transactions-card__title,
.transactions-card__description {
  display: block;
}

.transactions-card__title {
  color: var(--app-color-text-strong);
  font-size: 27rpx;
  font-weight: 600;
}

.transactions-card__description {
  margin-top: 7rpx;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
}

.support-section-title {
  margin-top: 34rpx;
}

.support-card {
  padding: 4rpx 24rpx;
}

.support-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx 0;
}

.support-row__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: var(--app-color-primary-50);
}

.support-row__title {
  flex: 1;
  color: var(--app-color-text);
  font-size: 25rpx;
  font-weight: 600;
}

.support-row__divider {
  height: 1rpx;
  margin-left: 82rpx;
  background: var(--app-color-border);
}

.consumption-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 28rpx;
  padding: 30rpx 26rpx;
  background: var(--app-gradient-brand-soft);
}

.consumption-card__copy {
  flex: 1;
  min-width: 0;
}

.consumption-card__eyebrow,
.consumption-card__title,
.consumption-card__description {
  display: block;
}

.consumption-card__eyebrow {
  color: var(--app-color-primary);
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.consumption-card__title {
  margin-top: 7rpx;
  color: var(--app-color-text-strong);
  font-size: 29rpx;
  font-weight: 700;
}

.consumption-card__description {
  margin-top: 8rpx;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.55;
}

.security-card__title {
  color: var(--app-color-text-strong);
  font-size: 27rpx;
  font-weight: 600;
}

.security-card__description {
  margin-top: 7rpx;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.5;
}

.account-notice__title {
  color: var(--app-color-warning-text);
  font-size: 27rpx;
  font-weight: 600;
}

.account-notice__description {
  margin-top: 8rpx;
  color: var(--app-color-warning-text);
  font-size: 23rpx;
  line-height: 1.6;
}

:deep(.account-notice__action) {
  margin-top: 22rpx;
}
</style>
