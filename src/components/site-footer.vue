<template>
  <!-- #ifdef H5 -->
  <view v-if="appConfig.icpFilingNumber" class="site-footer">
    <a
      class="site-footer__link"
      href="https://beian.miit.gov.cn/"
      target="_blank"
      rel="noopener noreferrer"
    >{{ appConfig.icpFilingNumber }}</a>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app'
</script>

<style lang="scss" scoped>
.site-footer {
  margin-top: 36rpx;
  padding: 12rpx 0;
  text-align: center;
}

.site-footer__link {
  display: inline-block;
  max-width: 100%;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.6;
  text-decoration: none;
  overflow-wrap: anywhere;
}
</style>
