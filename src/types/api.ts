export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  pageNum: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  items: T[]
}

export type ApiRequestData = string | AnyObject | ArrayBuffer

export type HttpMethod =
  | 'OPTIONS'
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'TRACE'
  | 'CONNECT'
