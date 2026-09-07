import { exchangeLoginTicket } from '@/api/auth'
import { authStore } from '@/stores/auth'
import { normalizeInternalPage, reLaunchInternalPage } from '@/utils/navigation'

const LOGIN_TICKET_PATTERN = /^[A-Za-z0-9_-]{43}$/

let activeTicket: string | null = null
let activeCompletion: Promise<void> | null = null

const normalizeTicket = (value: string | null | undefined): string | null => {
  const normalized = value?.trim() ?? ''
  return LOGIN_TICKET_PATTERN.test(normalized) ? normalized : null
}

export const readH5LoginTicketFromBrowserAddress = (): string | null => {
  let ticket: string | null = null

  // #ifdef H5
  const currentUrl = new URL(window.location.href)
  ticket = normalizeTicket(currentUrl.searchParams.get('loginTicket'))
  if (!ticket) {
    const hashQueryIndex = currentUrl.hash.indexOf('?')
    if (hashQueryIndex >= 0) {
      const hashQuery = new URLSearchParams(currentUrl.hash.slice(hashQueryIndex + 1))
      ticket = normalizeTicket(hashQuery.get('ticket'))
    }
  }
  // #endif

  return ticket
}

const clearH5LoginTicketFromBrowserAddress = (): void => {
  // #ifdef H5
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete('loginTicket')

  const hashQueryIndex = currentUrl.hash.indexOf('?')
  if (hashQueryIndex >= 0) {
    const hashPath = currentUrl.hash.slice(0, hashQueryIndex)
    const hashQuery = new URLSearchParams(currentUrl.hash.slice(hashQueryIndex + 1))
    hashQuery.delete('ticket')
    const remainingQuery = hashQuery.toString()
    currentUrl.hash = remainingQuery ? `${hashPath}?${remainingQuery}` : hashPath
  }

  window.history.replaceState(
    null,
    document.title,
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  )
  // #endif
}

const navigateAfterLogin = (returnPath: string | null): void => {
  const destination = normalizeInternalPage(returnPath)

  // #ifdef H5
  const currentUrl = new URL(window.location.href)
  window.location.replace(`${currentUrl.origin}${currentUrl.pathname}#${destination}`)
  // #endif

  // #ifndef H5
  reLaunchInternalPage(destination)
  // #endif
}

export const completeCustomerLogin = (ticket: string): Promise<void> => {
  const normalizedTicket = normalizeTicket(ticket)
  if (!normalizedTicket) {
    return Promise.reject(new Error('没有收到有效的一次性登录票据，请重新登录'))
  }
  if (activeTicket === normalizedTicket && activeCompletion) {
    return activeCompletion
  }

  activeTicket = normalizedTicket
  activeCompletion = (async () => {
    try {
      const result = await exchangeLoginTicket(normalizedTicket)
      authStore.setSession(result)
      navigateAfterLogin(result.returnPath)
    } catch (error) {
      clearH5LoginTicketFromBrowserAddress()
      throw error
    }
  })()
  return activeCompletion
}
