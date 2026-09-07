<template>
  <view class="callback-page">
    <wd-loading size="48px" color="#169b62" />
    <text class="callback-title">{{ title }}</text>
    <text class="callback-description">{{ description }}</text>
    <wd-button v-if="failed" type="primary" round @click="backToLogin">
      返回登录
    </wd-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getErrorMessage } from '@/api/error'
import {
  completeCustomerLogin,
  readH5LoginTicketFromBrowserAddress,
} from '@/platform/auth/login-callback'

const title = ref('正在完成登录')
const description = ref('请稍候，不要关闭页面')
const failed = ref(false)

const exchange = async (ticket: string): Promise<void> => {
  try {
    await completeCustomerLogin(ticket)
  } catch (error) {
    title.value = '登录没有完成'
    description.value = getErrorMessage(error)
    failed.value = true
  }
}

const backToLogin = (): void => {
  uni.reLaunch({ url: '/pages/auth/login' })
}

onLoad((query) => {
  const routeTicket = typeof query?.ticket === 'string' ? query.ticket.trim() : ''
  const ticket = routeTicket || readH5LoginTicketFromBrowserAddress() || ''
  if (!ticket) {
    title.value = '登录信息无效'
    description.value = '没有收到有效的一次性登录票据，请重新登录'
    failed.value = true
    return
  }
  void exchange(ticket)
})
</script>

<style lang="scss" scoped>
.callback-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: #f4f7f5;
  text-align: center;
}

.callback-title,
.callback-description {
  display: block;
}

.callback-title {
  margin-top: 30rpx;
  color: #24382f;
  font-size: 34rpx;
  font-weight: 600;
}

.callback-description {
  max-width: 560rpx;
  margin: 16rpx 0 36rpx;
  color: #819087;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
