export type ApiErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'UNKNOWN_ERROR'
export class ApiError extends Error {
  public readonly name = 'ApiError'
  public readonly code: ApiErrorCode
  public readonly status?: number
  public readonly problemTitle?: string

  constructor(code: ApiErrorCode, message: string, status?: number, problemTitle?: string) {
    super(message)
    this.code = code
    this.status = status
    this.problemTitle = problemTitle
  }
}
