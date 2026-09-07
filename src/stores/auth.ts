import { computed, reactive, readonly } from 'vue'
import {
  clearCustomerSession,
  isSessionExpired,
  loadCustomerSession,
  saveCustomerSession,
} from '@/platform/storage/customer-session'
import type { CustomerAccountView, CustomerSession } from '@/types/auth'

const state = reactive<{ session: CustomerSession | null }>({
  session: loadCustomerSession(),
})

const session = computed(() => state.session)
const user = computed(() => state.session?.user ?? null)
const isAuthenticated = computed(
  () => state.session !== null && !isSessionExpired(state.session),
)

const setSession = (nextSession: CustomerSession): void => {
  saveCustomerSession(nextSession)
  state.session = nextSession
}

const clearSession = (): void => {
  clearCustomerSession()
  state.session = null
}

const setUser = (nextUser: CustomerAccountView): void => {
  if (state.session === null) {
    return
  }
  setSession({ ...state.session, user: nextUser })
}

const restoreSession = (): void => {
  state.session = loadCustomerSession()
}

export const authStore = {
  state: readonly(state),
  session,
  user,
  isAuthenticated,
  setSession,
  setUser,
  clearSession,
  restoreSession,
}

export const useAuthStore = () => authStore
