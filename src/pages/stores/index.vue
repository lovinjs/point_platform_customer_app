<template>
  <view class="page-shell stores-page">
    <view class="hero-card">
      <view class="hero-card__mark">
        <wd-icon name="store" size="48rpx" color="#ffffff" />
      </view>
      <view class="hero-card__copy">
        <text class="hero-card__eyebrow">合作门店</text>
        <text class="hero-card__title">积分全平台通用</text>
        <text class="hero-card__description">
          可在任意正常营业的合作门店使用平台积分
        </text>
      </view>
    </view>

    <view class="search-card surface-card">
      <wd-search
        v-model="searchKeyword"
        hide-cancel
        placeholder="搜索门店名称或地址"
        placeholder-left
        variant="light"
        :maxlength="100"
        @clear="handleSearch"
        @search="handleSearch"
      />
    </view>

    <view class="list-heading">
      <text class="list-heading__title">可用门店</text>
      <text class="list-heading__count">
        {{ loading && pageNum === 0 ? '正在查询' : `共 ${total} 家` }}
      </text>
    </view>

    <view v-if="loading && stores.length === 0" class="state-panel">
      <wd-loading color="#168e5d" size="48rpx" />
      <text>正在读取合作门店</text>
    </view>

    <view v-else-if="loadError && stores.length === 0" class="state-panel">
      <wd-icon name="refresh" size="52rpx" color="#8a9991" />
      <text>门店读取失败，请稍后重试</text>
      <wd-button type="primary" variant="soft" size="small" round @click="reload">
        重新加载
      </wd-button>
    </view>

    <view v-else-if="stores.length === 0" class="state-panel state-panel--empty">
      <wd-empty icon="search" tip="没有找到符合条件的合作门店" />
    </view>

    <view v-else class="store-list">
      <view
        v-for="store in stores"
        :key="store.storeId"
        class="store-card surface-card"
        hover-class="store-card--pressed"
        @click="openStore(store.storeId)"
      >
        <view class="store-card__heading">
          <view class="store-card__badge">{{ storeInitial(store.storeName) }}</view>
          <view class="store-card__identity">
            <text class="store-card__name">{{ store.storeName }}</text>
            <text class="store-card__merchant">{{ store.merchantName }}</text>
          </view>
          <wd-icon name="arrow-right" size="28rpx" color="#91a098" />
        </view>

        <view class="store-card__detail">
          <wd-icon name="location" size="27rpx" color="#759087" />
          <text>{{ store.address }}</text>
        </view>
        <view class="store-card__detail">
          <wd-icon name="phone" size="27rpx" color="#759087" />
          <text>{{ store.contactPhone }}</text>
        </view>

        <view class="store-card__actions">
          <wd-button
            type="primary"
            variant="soft"
            size="small"
            round
            @click.stop="callStore(store.contactPhone)"
          >
            电话联系
          </wd-button>
          <wd-button
            type="info"
            variant="soft"
            size="small"
            round
            @click.stop="copyAddress(store.address)"
          >
            复制地址
          </wd-button>
        </view>
      </view>

      <wd-loadmore
        :state="loadMoreState"
        loading-text="正在加载更多"
        finished-text="已显示全部合作门店"
        error-text="加载失败，点击重试"
        @reload="loadMore"
      />
    </view>

    <wd-toast />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import { useToast } from '@/uni_modules/wot-ui'
import { getErrorMessage } from '@/api/error'
import { getCustomerStores } from '@/api/stores'
import type { CustomerStore } from '@/types/store'

type LoadMoreState = 'loading' | 'error' | 'finished' | undefined

const PAGE_SIZE = 20
const toast = useToast()
const searchKeyword = ref('')
const appliedKeyword = ref('')
const stores = ref<CustomerStore[]>([])
const pageNum = ref(0)
const total = ref(0)
const hasNext = ref(false)
const loading = ref(false)
const loadError = ref(false)
let requestVersion = 0

const loadMoreState = computed<LoadMoreState>(() => {
  if (loading.value) return 'loading'
  if (loadError.value) return 'error'
  if (!hasNext.value) return 'finished'
  return undefined
})

const storeInitial = (storeName: string): string => Array.from(storeName.trim())[0] || '店'

const loadPage = async (nextPage: number, replace: boolean): Promise<void> => {
  if (loading.value) return
  const version = requestVersion
  loading.value = true
  loadError.value = false
  try {
    const result = await getCustomerStores(nextPage, PAGE_SIZE, appliedKeyword.value)
    if (version !== requestVersion) return
    stores.value = replace ? result.items : [...stores.value, ...result.items]
    pageNum.value = result.pageNum
    total.value = result.total
    hasNext.value = result.hasNext
  } catch (error) {
    if (version !== requestVersion) return
    loadError.value = true
    if (replace) {
      toast.warning(getErrorMessage(error))
    }
  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

const reload = async (): Promise<void> => {
  requestVersion += 1
  loading.value = false
  stores.value = []
  pageNum.value = 0
  total.value = 0
  hasNext.value = false
  loadError.value = false
  await loadPage(1, true)
}

const handleSearch = (): void => {
  appliedKeyword.value = searchKeyword.value.trim()
  void reload()
}

const loadMore = (): void => {
  if (loading.value || !hasNext.value) return
  void loadPage(pageNum.value + 1, false)
}

const openStore = (storeId: number): void => {
  uni.navigateTo({ url: `/pages/stores/detail?storeId=${encodeURIComponent(storeId)}` })
}

const callStore = (phoneNumber: string): void => {
  uni.makePhoneCall({ phoneNumber })
}

const copyAddress = (address: string): void => {
  uni.setClipboardData({
    data: address,
    success: () => toast.success('门店地址已复制'),
  })
}

onShow(() => {
  if (pageNum.value === 0) {
    void reload()
  }
})

onPullDownRefresh(async () => {
  await reload()
  uni.stopPullDownRefresh()
})

onReachBottom(loadMore)
</script>

<style lang="scss" scoped>
.stores-page {
  padding-top: 28rpx;
}

.hero-card {
  display: flex;
  align-items: center;
  gap: 26rpx;
  padding: 34rpx 30rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #0c6042 0%, #1aa66b 100%);
  box-shadow: 0 20rpx 44rpx rgba(14, 117, 76, 0.2);
  color: #ffffff;
}

.hero-card__mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.14);
}

.hero-card__copy {
  flex: 1;
  min-width: 0;
}

.hero-card__eyebrow,
.hero-card__title,
.hero-card__description,
.store-card__name,
.store-card__merchant {
  display: block;
}

.hero-card__eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 21rpx;
  letter-spacing: 3rpx;
}

.hero-card__title {
  margin-top: 8rpx;
  font-size: 35rpx;
  font-weight: 700;
}

.hero-card__description {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
  line-height: 1.5;
}

.search-card {
  margin-top: 24rpx;
  padding: 8rpx 10rpx;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 34rpx 4rpx 18rpx;
}

.list-heading__title {
  color: #24382f;
  font-size: 30rpx;
  font-weight: 650;
}

.list-heading__count {
  color: #89968f;
  font-size: 22rpx;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
  padding: 92rpx 20rpx;
  color: #7c8b83;
  font-size: 24rpx;
}

.state-panel--empty {
  padding-top: 60rpx;
}

.store-card {
  margin-bottom: 20rpx;
  padding: 28rpx 26rpx 24rpx;
  transition: transform 0.15s ease;
}

.store-card--pressed {
  transform: scale(0.99);
  background: #f9fcfa;
}

.store-card__heading {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.store-card__badge {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 23rpx;
  background: linear-gradient(145deg, #ddf5e9, #eefaf4);
  color: #108052;
  font-size: 30rpx;
  font-weight: 700;
}

.store-card__identity {
  flex: 1;
  min-width: 0;
}

.store-card__name {
  overflow: hidden;
  color: #24382f;
  font-size: 29rpx;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-card__merchant {
  overflow: hidden;
  margin-top: 7rpx;
  color: #8a9890;
  font-size: 21rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-card__detail {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin-top: 19rpx;
  color: #65766d;
  font-size: 23rpx;
  line-height: 1.55;
}

.store-card__detail text {
  flex: 1;
}

.store-card__actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 22rpx;
  border-top: 1rpx solid #edf1ef;
}
</style>
