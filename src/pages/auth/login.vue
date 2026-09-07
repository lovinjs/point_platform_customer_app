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
const toast = useToast()

const authorize = async (): Promise<void> => {
  if (authorizing.value) {
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
  background: linear-gradient(135deg, #0c6545, #26aa70);
  box-shadow: 0 20rpx 44rpx rgba(16, 135, 85, 0.25);
  color: #ffffff;
  font-size: 52rpx;
  font-weight: 700;
}

.login-title,
.login-description,
.login-help {
  display: block;
}

.login-title {
  color: #18231e;
  font-size: 44rpx;
  font-weight: 700;
}

.login-description {
  max-width: 590rpx;
  margin: 20rpx auto 52rpx;
  color: #75847c;
  font-size: 26rpx;
  line-height: 1.7;
}

.security-notes {
  margin-bottom: 44rpx;
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
  background: #edf8f2;
  color: #168e5d;
  font-size: 22rpx;
  font-weight: 700;
}

.security-note__text {
  color: #3c4c44;
  font-size: 25rpx;
}

.login-help {
  margin-top: 24rpx;
  color: #9aa59f;
  font-size: 22rpx;
}
</style>
