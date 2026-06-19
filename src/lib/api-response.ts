export interface ApiMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  success?: boolean
  statusCode?: number
  message?: string
  data: T
  meta?: ApiMeta
  timestamp?: string
  path?: string
}

export function apiResponse<T>(response: unknown) {
  return response as ApiResponse<T>
}

export function apiPaginatedResponse<T>(response: unknown) {
  return response as ApiResponse<T[]> & { meta: ApiMeta }
}

export interface ApiErrorBody {
  message?: string
  error?: string
  statusCode?: number
}

export interface ApiErrorLike {
  response?: {
    data?: ApiErrorBody
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as ApiErrorLike).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}
