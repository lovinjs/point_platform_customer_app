const DEFAULT_PAGE = '/pages/index/index'
const SAFE_PAGE_PATTERN = /^\/pages\/[a-z0-9/_-]+$/i

export const normalizeInternalPage = (path: string | null | undefined): string => {
  if (!path) {
    return DEFAULT_PAGE
  }
  const normalized = path.split('?')[0]
  return SAFE_PAGE_PATTERN.test(normalized) ? normalized : DEFAULT_PAGE
}

export const reLaunchInternalPage = (path: string | null | undefined): void => {
  uni.reLaunch({ url: normalizeInternalPage(path) })
}
