const sessionStorageKey = 'blogfrontend.auth'

function emitSessionChange() {
  window.dispatchEvent(new Event('sessionchange'))
}

export function isSessionExpired(session) {
  if (!session?.expiresAt) {
    return true
  }

  return new Date(session.expiresAt).getTime() <= Date.now()
}

export function getStoredSession() {
  const rawValue = window.localStorage.getItem(sessionStorageKey)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue)

    if (isSessionExpired(parsedValue)) {
      window.localStorage.removeItem(sessionStorageKey)
      return null
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export function storeSession(session) {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session))
  emitSessionChange()
}

export function updateStoredSessionUser(user) {
  const session = getStoredSession()

  if (!session) {
    return
  }

  window.localStorage.setItem(
    sessionStorageKey,
    JSON.stringify({
      ...session,
      user,
    })
  )

  emitSessionChange()
}

export function clearSession() {
  window.localStorage.removeItem(sessionStorageKey)
  emitSessionChange()
}
