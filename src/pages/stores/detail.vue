<template>
  <view class="page-shell store-detail-page">
    <view v-if="loading" class="state-panel">
      <wd-loading color="#168e5d" size="48rpx" />
      <text>正在读取门店详情</text>
    </view>

    <view v-else-if="loadError || !store" class="state-panel">
      <wd-icon name="refresh" size="52rpx" color="#8a9991" />
      <text>{{ loadError || '门店信息不存在' }}</text>
      <wd-button
        v-if="storeId"
        type="primary"
        variant="soft"
        size="small"
        round
        @click="loadStore"
      >
        重新加载
      </wd-button>
    </view>

    <template v-else>
      <view class="identity-card">
        <view class="identity-card__badge">{{ storeInitial }}</view>
        <text class="identity-card__eyebrow">正常营业 · 合作门店</text>
        <text class="identity-card__title">{{ store.storeName }}</text>
        <text class="identity-card__merchant">{{ store.merchantName }}</text>
      </view>

      <text class="section-title">门店信息</text>
      <view class="surface-card detail-card">
        <view class="detail-row">
          <view class="detail-row__icon">
            <wd-icon name="location" size="34rpx" color="#168e5d" />
          </view>
          <view class="detail-row__copy">
            <text class="detail-row__label">门店地址</text>
            <text class="detail-row__value">{{ store.address }}</text>
          </view>
          <wd-button type="primary" variant="text" size="small" @click="copyAddress">
            复制
          </wd-button>
        </view>

        <view class="detail-divider" />

        <view class="detail-row">
          <view class="detail-row__icon">
            <wd-icon name="phone" size="34rpx" color="#168e5d" />
          </view>
          <view class="detail-row__copy">
            <text class="detail-row__label">联系电话</text>
            <text class="detail-row__value">{{ store.contactPhone }}</text>
          </view>
          <wd-button type="primary" variant="text" size="small" @click="callStore">
            拨打
          </wd-button>
        </view>
      </view>

      <view class="usage-card surface-card">
        <view class="usage-card__icon">
          <wd-icon name="safe" size="40rpx" color="#168e5d" />
        </view>
        <view class="usage-card__copy">
          <text class="usage-card__title">平台积分可在本店使用</text>
          <text class="usage-card__description">
            到店后由店员发起消费订单，你在自己的手机上核对金额并输入消费密码确认。
          </text>
        </view>
      </view>

      <view class="action-bar">
        <wd-button type="primary" size="large" block round @click="callStore">
          电话联系门店
        </wd-button>
      </view>
    </template>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import { getErrorMessage } from '@/api/error'
import { getCustomerStore } from '@/api/stores'
import type { CustomerStore } from '@/types/store'

const toast = useToast()
const storeId = ref<number>()
const store = ref<CustomerStore>()
const loading = ref(false)
const loadError = ref('')

const storeInitial = computed(() => {
  const name = store.value?.storeName.trim() ?? ''
  return Array.from(name)[0] || '店'
})

const loadStore = async (): Promise<void> => {
  if (!storeId.value || loading.value) return
  loading.value = true
  loadError.value = ''
  try {
    store.value = await getCustomerStore(storeId.value)
  } catch (error) {
    store.value = undefined
    loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const callStore = (): void => {
  if (!store.value) return
  uni.makePhoneCall({ phoneNumber: store.value.contactPhone })
}

const copyAddress = (): void => {
  if (!store.value) return
  uni.setClipboardData({
    data: store.value.address,
    success: () => toast.success('门店地址已复制'),
  })
}

onLoad((query) => {
  const parsedStoreId = Number(query?.storeId)
  if (!Number.isSafeInteger(parsedStoreId) || parsedStoreId <= 0) {
    loadError.value = '门店参数不正确'
    return
  }
  storeId.value = parsedStoreId
  void loadStore()
})
</script>

<style lang="scss" scoped>
.store-detail-page {
  padding-top: 28rpx;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
  padding: 130rpx 20rpx;
  color: #7c8b83;
  font-size: 24rpx;
}

.identity-card {
  position: relative;
  overflow: hidden;
  padding: 42rpx 34rpx 38rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #0b6042, #1ba46a);
  box-shadow: 0 20rpx 44rpx rgba(14, 117, 76, 0.2);
  color: #ffffff;
}

.identity-card::after {
  position: absolute;
  top: -80rpx;
  right: -70rpx;
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  content: '';
}

.identity-card__badge {
  display: flex;
  position: relative;
  z-index: 1;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.26);
  border-radius: 27rpx;
  background: rgba(255, 255, 255, 0.14);
  font-size: 34rpx;
  font-weight: 700;
}

.identity-card__eyebrow,
.identity-card__title,
.identity-card__merchant,
.detail-row__label,
.detail-row__value,
.usage-card__title,
.usage-card__description {
  display: block;
}

.identity-card__eyebrow {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: 21rpx;
  letter-spacing: 2rpx;
}

.identity-card__title {
  position: relative;
  z-index: 1;
  margin-top: 9rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.identity-card__merchant {
  position: relative;
  z-index: 1;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 23rpx;
}

.detail-card {
  padding: 6rpx 26rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 26rpx 0;
}

.detail-row__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 21rpx;
  background: #eef8f3;
}

.detail-row__copy {
  flex: 1;
  min-width: 0;
}

.detail-row__label {
  color: #8a9890;
  font-size: 21rpx;
}

.detail-row__value {
  margin-top: 7rpx;
  color: #31463c;
  font-size: 25rpx;
  line-height: 1.55;
}

.detail-divider {
  height: 1rpx;
  margin-left: 86rpx;
  background: #edf1ef;
}

.usage-card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-top: 26rpx;
  padding: 28rpx 26rpx;
}

.usage-card__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: #eef8f3;
}

.usage-card__copy {
  flex: 1;
}

.usage-card__title {
  color: #24382f;
  font-size: 27rpx;
  font-weight: 650;
}

.usage-card__description {
  margin-top: 9rpx;
  color: #74847b;
  font-size: 22rpx;
  line-height: 1.65;
}

.action-bar {
  margin-top: 32rpx;
}
</style>
