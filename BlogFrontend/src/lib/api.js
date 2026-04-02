import { clearSession, getStoredSession } from './session'

export class ApiError extends Error
{
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requestJson(url, options = {}) {
  const { auth = false, headers = {}, ...restOptions } = options
  const requestHeaders = { ...headers }

  if (auth) {
    const session = getStoredSession()

    if (!session?.token) {
      clearSession()
      throw new ApiError('Your session has expired. Please sign in again.', 401)
    }

    requestHeaders.Authorization = `Bearer ${session.token}`
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJsonResponse = contentType.includes('application/json')
  const payload = isJsonResponse ? await response.json().catch(() => null) : null

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }

    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status
    )
  }

  if (response.status === 204) {
    return null
  }

  return payload
}
