<template>
  <view class="page-shell legal-page">
    <view class="legal-hero">
      <view class="legal-hero__icon">
        <wd-icon :name="document.icon" size="46rpx" :color="themeColors.white" />
      </view>
      <text class="legal-hero__eyebrow">法律与规则</text>
      <text class="legal-hero__title">{{ document.title }}</text>
      <view class="legal-hero__meta">
        <wd-tag type="warning" variant="light" round>{{ document.statusLabel }}</wd-tag>
        <text>版本 {{ document.version }}</text>
      </view>
    </view>

    <view class="draft-notice surface-card">
      <wd-icon name="info-circle" size="34rpx" :color="themeColors.warning" />
      <text>{{ document.draftNotice }}</text>
    </view>

    <view class="document-meta surface-card">
      <view class="document-meta__item">
        <text>更新日期</text>
        <text>{{ document.updatedDate }}</text>
      </view>
      <view class="document-meta__divider" />
      <view class="document-meta__item">
        <text>生效日期</text>
        <text>{{ document.effectiveDate }}</text>
      </view>
    </view>

    <view
      v-for="(section, sectionIndex) in document.sections"
      :key="section.title"
      class="legal-section surface-card"
    >
      <text class="legal-section__title">{{ sectionIndex + 1 }}. {{ section.title }}</text>
      <text
        v-for="paragraph in section.paragraphs"
        :key="paragraph"
        class="legal-section__paragraph"
      >
        {{ paragraph }}
      </text>
      <view v-if="section.items?.length" class="legal-section__list">
        <view v-for="item in section.items" :key="item" class="legal-section__item">
          <view class="legal-section__dot" />
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <text class="legal-footer">请在正式上线前再次核对当前文档版本</text>
  </view>
</template>

<script setup lang="ts">
import { themeColors } from '@/config/theme'
import type { LegalDocument } from '@/types/legal'

defineProps<{
  document: LegalDocument
}>()
</script>

<style lang="scss" scoped>
.legal-page {
  padding-top: 28rpx;
}

.legal-hero {
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  background: var(--app-gradient-brand);
  box-shadow: var(--app-shadow-brand);
  color: var(--app-color-on-brand);
}

.legal-hero__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82rpx;
  height: 82rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid var(--app-color-on-brand-border);
  border-radius: 25rpx;
  background: var(--app-color-on-brand-surface);
}

.legal-hero__eyebrow,
.legal-hero__title,
.legal-section__title,
.legal-section__paragraph,
.legal-footer {
  display: block;
}

.legal-hero__eyebrow {
  color: var(--app-color-on-brand-muted);
  font-size: 21rpx;
  letter-spacing: 3rpx;
}

.legal-hero__title {
  margin-top: 8rpx;
  font-size: 38rpx;
  font-weight: 700;
}

.legal-hero__meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 22rpx;
  color: var(--app-color-on-brand-muted);
  font-size: 21rpx;
}

.draft-notice {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 24rpx;
  border-color: var(--app-color-warning-border);
  background: var(--app-color-warning-soft);
  color: var(--app-color-warning-text);
  font-size: 22rpx;
  line-height: 1.65;
}

.draft-notice text {
  flex: 1;
}

.document-meta {
  display: flex;
  align-items: stretch;
  margin-top: 24rpx;
  padding: 22rpx 26rpx;
}

.document-meta__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
  color: var(--app-color-text-muted);
  font-size: 20rpx;
}

.document-meta__item text:last-child {
  color: var(--app-color-text);
  font-size: 23rpx;
  font-weight: 600;
}

.document-meta__divider {
  width: 1rpx;
  margin: 0 24rpx;
  background: var(--app-color-border);
}

.legal-section {
  margin-top: 22rpx;
  padding: 28rpx 26rpx;
}

.legal-section__title {
  margin-bottom: 18rpx;
  color: var(--app-color-text-strong);
  font-size: 28rpx;
  font-weight: 650;
}

.legal-section__paragraph {
  margin-top: 14rpx;
  color: var(--app-color-text-secondary);
  font-size: 23rpx;
  line-height: 1.8;
}

.legal-section__list {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: var(--app-color-surface-soft);
}

.legal-section__item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin-top: 12rpx;
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.65;
}

.legal-section__item:first-child {
  margin-top: 0;
}

.legal-section__dot {
  flex: none;
  width: 9rpx;
  height: 9rpx;
  margin-top: 13rpx;
  border-radius: 50%;
  background: var(--app-color-primary);
}

.legal-section__item text {
  flex: 1;
}

.legal-footer {
  padding: 34rpx 0 12rpx;
  color: var(--app-color-text-placeholder);
  font-size: 20rpx;
  text-align: center;
}
</style>
