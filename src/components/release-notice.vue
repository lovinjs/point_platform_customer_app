<template>
  <view v-if="appConfig.releaseChannel === 'staging'" class="release-notice">
    <text class="release-notice__title">预发布测试</text>
    <text class="release-notice__description">仅供联调，请勿实际充值或结算。</text>
  </view>
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app'
</script>

<style lang="scss" scoped>
.release-notice {
  margin-bottom: 24rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid var(--app-color-warning-border);
  border-radius: 20rpx;
  background: var(--app-color-warning-soft);
  color: var(--app-color-warning-text);
  text-align: left;
}

.release-notice__title,
.release-notice__description {
  display: block;
}

.release-notice__title {
  font-size: 24rpx;
  font-weight: 600;
}

.release-notice__description {
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.5;
}
</style>
