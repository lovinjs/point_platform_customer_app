export type ApiErrorKind = 'BUSINESS' | 'HTTP' | 'NETWORK' | 'PROTOCOL'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly code: number | null
  readonly statusCode: number | null
  readonly details: unknown

  constructor(options: {
    kind: ApiErrorKind
    message: string
    code?: number | null
    statusCode?: number | null
    details?: unknown
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.kind = options.kind
    this.code = options.code ?? null
    this.statusCode = options.statusCode ?? null
    this.details = options.details
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return '操作失败，请稍后重试'
}
