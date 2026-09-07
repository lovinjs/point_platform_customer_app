<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { getErrorMessage } from '@/api/error'
import {
  completeCustomerLogin,
  readH5LoginTicketFromBrowserAddress,
} from '@/platform/auth/login-callback'
import { authStore } from '@/stores/auth'

onLaunch(() => {
  authStore.restoreSession()

  // #ifdef H5
  const loginTicket = readH5LoginTicketFromBrowserAddress()
  if (loginTicket) {
    void completeCustomerLogin(loginTicket).catch((error) => {
      uni.showToast({
        title: getErrorMessage(error),
        icon: 'none',
        duration: 3000,
      })
    })
  }
  // #endif
});
onShow(() => {
  authStore.restoreSession()
});
onHide(() => {
  // 应用隐藏时不清除登录态，令牌有效期由存储层统一检查。
});
</script>
<style lang="scss">
@use '@/styles/global.scss';
</style>
