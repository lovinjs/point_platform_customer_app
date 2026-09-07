import { appConfig, resolveApiUrl } from '@/config/app'
import { getCustomerAccessToken } from '@/platform/storage/customer-session'
import { authStore } from '@/stores/auth'
import { getClientPlatform } from '@/platform/runtime'
import type { ApiRequestData, ApiResponse, HttpMethod } from '@/types/api'
import { ApiError } from './error'

const SUCCESS_CODE = 200

export interface ApiRequestOptions<TData = ApiRequestData> {
  path: string
  method?: HttpMethod
  data?: TData
  headers?: Record<string, string>
  authenticated?: boolean
  timeoutMs?: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseResponse = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  isRecord(value) && typeof value.code === 'number' && typeof value.msg === 'string'

const executeRequest = <TData>(
  options: ApiRequestOptions<TData>,
): Promise<UniNamespace.RequestSuccessCallbackResult> =>
  new Promise((resolve, reject) => {
    const token = options.authenticated === false ? null : getCustomerAccessToken()
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Client-Platform': getClientPlatform(),
      ...options.headers,
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    uni.request({
      url: resolveApiUrl(options.path),
      method: options.method ?? 'GET',
      data: options.data as ApiRequestData | undefined,
      header: headers,
      timeout: options.timeoutMs ?? appConfig.requestTimeoutMs,
      dataType: 'json',
      success: resolve,
      fail: (failure) => {
        reject(
          new ApiError({
            kind: 'NETWORK',
            message: failure.errMsg || '网络连接失败，请检查网络后重试',
            details: failure,
          }),
        )
      },
    })
  })

export const request = async <TResponse, TData = ApiRequestData>(
  options: ApiRequestOptions<TData>,
): Promise<TResponse> => {
  const response = await executeRequest(options)
  const body = parseResponse(response.data)

  if (!isApiResponse(body)) {
    throw new ApiError({
      kind: 'PROTOCOL',
      message: '服务器返回格式异常',
      statusCode: response.statusCode,
      details: body,
    })
  }

  if (response.statusCode >= 200 && response.statusCode < 300 && body.code === SUCCESS_CODE) {
    return body.data as TResponse
  }

  if (response.statusCode === 401) {
    authStore.clearSession()
    uni.$emit('customer-auth-expired')
  }

  throw new ApiError({
    kind: body.code === SUCCESS_CODE ? 'HTTP' : 'BUSINESS',
    message: body.msg || '请求失败，请稍后重试',
    code: body.code,
    statusCode: response.statusCode,
    details: body.data,
  })
}

export const get = <TResponse>(
  path: string,
  options: Omit<ApiRequestOptions<never>, 'path' | 'method' | 'data'> = {},
): Promise<TResponse> => request<TResponse, never>({ ...options, path, method: 'GET' })

export const post = <TResponse, TData extends ApiRequestData = AnyObject>(
  path: string,
  data: TData,
  options: Omit<ApiRequestOptions<TData>, 'path' | 'method' | 'data'> = {},
): Promise<TResponse> => request<TResponse, TData>({ ...options, path, method: 'POST', data })

export const put = <TResponse, TData extends ApiRequestData = AnyObject>(
  path: string,
  data: TData,
  options: Omit<ApiRequestOptions<TData>, 'path' | 'method' | 'data'> = {},
): Promise<TResponse> => request<TResponse, TData>({ ...options, path, method: 'PUT', data })
