import type { LoginTicketExchangeResult } from '@/types/auth'
import { post } from './http'

interface ExchangeLoginTicketRequest extends AnyObject {
  ticket: string
}

export const exchangeLoginTicket = (ticket: string): Promise<LoginTicketExchangeResult> =>
  post<LoginTicketExchangeResult, ExchangeLoginTicketRequest>(
    '/api/v1/h5/auth/session/exchange',
    { ticket },
    { authenticated: false },
  )
