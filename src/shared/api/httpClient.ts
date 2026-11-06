import axios, { type AxiosError } from 'axios'
import { getPublicEnv } from '../config/env.ts'
import { ApiError, type ApiErrorCode } from './errors.ts'

const env = getPublicEnv()
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}
function errorCodeForStatus(status?: number): ApiErrorCode { if (!status) return 'NETWORK_ERROR'; if (status === 408) return 'TIMEOUT'; if (status === 401) return 'UNAUTHORIZED'; if (status === 403) return 'FORBIDDEN'; if (status === 404) return 'NOT_FOUND'; if (status === 409) return 'CONFLICT'; if (status === 422) return 'VALIDATION_ERROR'; if (status === 429) return 'RATE_LIMITED'; if (status >= 500) return 'SERVER_ERROR'; return 'UNKNOWN_ERROR' }
function problemTitleForError(error: AxiosError<unknown>): string | undefined { const data = error.response?.data; if (!data || typeof data !== 'object' || !('title' in data) || typeof data.title !== 'string') return undefined; return data.title }
function messageForError(error: AxiosError<unknown>, problemTitle?: string): string { if (problemTitle) return problemTitle; if (error.code === 'ECONNABORTED') return 'Превышено время ожидания ответа сервера.'; if (!error.response) return 'Не удалось подключиться к серверу. Проверьте соединение с интернетом.'; return `Сервер вернул ошибку ${error.response.status}.` }
export function normalizeHttpError(error: unknown): ApiError { if (error instanceof ApiError) return error; if (!axios.isAxiosError(error)) return new ApiError('UNKNOWN_ERROR', 'Произошла непредвиденная ошибка.'); const typedError = error as AxiosError<unknown>; const code = typedError.code === 'ECONNABORTED' ? 'TIMEOUT' : errorCodeForStatus(typedError.response?.status); const problemTitle = problemTitleForError(typedError); return new ApiError(code, messageForError(typedError, problemTitle), typedError.response?.status, problemTitle) }
export const httpClient = axios.create({ baseURL: env.apiBaseUrl, timeout: env.apiTimeoutMs, withCredentials: true })
httpClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})
httpClient.interceptors.response.use((response) => response, (error: unknown) => Promise.reject(normalizeHttpError(error)))
