<template>
  <view class="page-shell help-page">
    <view class="help-hero">
      <view class="help-hero__icon">
        <wd-icon name="question-circle" size="48rpx" :color="themeColors.white" />
      </view>
      <view class="help-hero__copy">
        <text class="help-hero__eyebrow">帮助中心</text>
        <text class="help-hero__title">常见问题与平台规则</text>
        <text class="help-hero__description">快速了解充值、消费、退款和账户安全</text>
      </view>
    </view>

    <text class="section-title">常见问题</text>
    <view class="faq-card surface-card">
      <wd-collapse v-model="activeQuestion" accordion>
        <wd-collapse-item
          v-for="question in questions"
          :key="question.id"
          :name="question.id"
          :title="question.title"
          border
        >
          <text class="faq-answer">{{ question.answer }}</text>
        </wd-collapse-item>
      </wd-collapse>
    </view>

    <text class="section-title">协议与隐私</text>
    <view class="document-links surface-card">
      <view class="document-link" @click="openUserAgreement">
        <view class="document-link__icon">
          <wd-icon name="file" size="35rpx" :color="themeColors.primary" />
        </view>
        <view class="document-link__copy">
          <text class="document-link__title">用户协议</text>
          <text class="document-link__description">
            {{ userAgreementDocument.statusLabel }} · {{ userAgreementDocument.version }}
          </text>
        </view>
        <wd-icon name="right" size="28rpx" :color="themeColors.iconMuted" />
      </view>
      <view class="document-link__divider" />
      <view class="document-link" @click="openPrivacyPolicy">
        <view class="document-link__icon">
          <wd-icon name="safe" size="35rpx" :color="themeColors.primary" />
        </view>
        <view class="document-link__copy">
          <text class="document-link__title">隐私政策</text>
          <text class="document-link__description">
            {{ privacyPolicyDocument.statusLabel }} · {{ privacyPolicyDocument.version }}
          </text>
        </view>
        <wd-icon name="right" size="28rpx" :color="themeColors.iconMuted" />
      </view>
    </view>

    <view class="service-notice surface-card">
      <wd-icon name="info-circle" size="34rpx" :color="themeColors.primary" />
      <view class="service-notice__copy">
        <text class="service-notice__title">当前为开发测试阶段</text>
        <text class="service-notice__description">
          正式客服和投诉渠道将在运营主体确定后公布。
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { privacyPolicyDocument, userAgreementDocument } from '@/config/legal'
import { themeColors } from '@/config/theme'

interface HelpQuestion {
  id: string
  title: string
  answer: string
}

const activeQuestion = ref('')
const questions: HelpQuestion[] = [
  {
    id: 'points',
    title: '平台积分如何使用？',
    answer:
      '当前1元对应1积分，积分暂不过期，可在正常营业的合作门店通用。积分不是现金，不支持转账或私下交易。',
  },
  {
    id: 'recharge',
    title: '如何为账户充值？',
    answer:
      '当前采用线下充值模式。充值款进入平台账户，门店工作人员确认实际到账后，在后台为你的账户创建充值订单。',
  },
  {
    id: 'consumption',
    title: '到店消费如何确认？',
    answer:
      '门店工作人员发起消费订单后，请在“我的－待确认消费”中核对门店和金额，再输入消费密码确认。不要把消费密码交给门店或其他人。',
  },
  {
    id: 'pending',
    title: '没有看到待消费订单怎么办？',
    answer:
      '请确认门店使用的是你当前绑定的手机号，并在待确认消费页面稍候自动刷新，也可以下拉刷新。仍未出现时，请门店核对订单是否发起成功。',
  },
  {
    id: 'refund',
    title: '充值后可以退款吗？',
    answer:
      '只有一笔充值对应的积分尚未发生消费时，才具备整单退款的基础条件；目前不支持部分退款。已确认完成的消费原则上不支持退款，法律法规另有规定的除外。',
  },
  {
    id: 'pin',
    title: '忘记消费密码怎么办？',
    answer:
      '进入“我的－消费密码”，选择忘记密码，通过已绑定手机号接收验证码并重新设置。验证码和新密码都不要告诉他人。',
  },
  {
    id: 'stores',
    title: '为什么找不到某家门店？',
    answer:
      '门店列表只展示当前正常合作的门店。你可以搜索门店名称或地址，也可以联系门店确认其合作状态和营业情况。',
  },
  {
    id: 'security',
    title: '如何保护账户安全？',
    answer:
      '请保管好微信账户、手机号、短信验证码和消费密码。确认消费前务必核对门店与金额，发现异常订单时不要输入密码。',
  },
]

const openUserAgreement = (): void => {
  uni.navigateTo({ url: '/pages/legal/user-agreement' })
}

const openPrivacyPolicy = (): void => {
  uni.navigateTo({ url: '/pages/legal/privacy-policy' })
}
</script>

<style lang="scss" scoped>
.help-page {
  padding-top: 28rpx;
}

.help-hero {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 34rpx 30rpx;
  border-radius: 32rpx;
  background: var(--app-gradient-brand);
  box-shadow: var(--app-shadow-brand);
  color: var(--app-color-on-brand);
}

.help-hero__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border: 1rpx solid var(--app-color-on-brand-border);
  border-radius: 27rpx;
  background: var(--app-color-on-brand-surface);
}

.help-hero__copy {
  flex: 1;
  min-width: 0;
}

.help-hero__eyebrow,
.help-hero__title,
.help-hero__description,
.faq-answer,
.document-link__title,
.document-link__description,
.service-notice__title,
.service-notice__description {
  display: block;
}

.help-hero__eyebrow {
  color: var(--app-color-on-brand-muted);
  font-size: 21rpx;
  letter-spacing: 3rpx;
}

.help-hero__title {
  margin-top: 7rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.help-hero__description {
  margin-top: 9rpx;
  color: var(--app-color-on-brand-muted);
  font-size: 21rpx;
}

.faq-card {
  overflow: hidden;
  padding: 0 26rpx;
}

.faq-answer {
  color: var(--app-color-text-secondary);
  font-size: 22rpx;
  line-height: 1.75;
}

.document-links {
  padding: 4rpx 24rpx;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx 0;
}

.document-link__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  border-radius: 20rpx;
  background: var(--app-color-primary-50);
}

.document-link__copy {
  flex: 1;
}

.document-link__title {
  color: var(--app-color-text-strong);
  font-size: 25rpx;
  font-weight: 600;
}

.document-link__description {
  margin-top: 6rpx;
  color: var(--app-color-text-muted);
  font-size: 20rpx;
}

.document-link__divider {
  height: 1rpx;
  margin-left: 84rpx;
  background: var(--app-color-border);
}

.service-notice {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 28rpx;
  padding: 24rpx;
  background: var(--app-color-primary-50);
}

.service-notice__copy {
  flex: 1;
}

.service-notice__title {
  color: var(--app-color-text-strong);
  font-size: 24rpx;
  font-weight: 600;
}

.service-notice__description {
  margin-top: 7rpx;
  color: var(--app-color-text-secondary);
  font-size: 21rpx;
  line-height: 1.6;
}

:deep(.wd-collapse-item__header) {
  padding: 28rpx 0;
}

:deep(.wd-collapse-item__title) {
  color: var(--app-color-text);
  font-size: 24rpx;
  font-weight: 600;
}

:deep(.wd-collapse-item__body) {
  padding: 0 0 26rpx;
}
</style>
