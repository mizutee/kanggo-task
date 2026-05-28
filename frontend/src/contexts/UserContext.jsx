import { useMemo, useState } from 'react'

import UserContext from './userContext'

const TOKEN_STORAGE_KEY = 'kanggo_token'
const USER_STORAGE_KEY = 'kanggo_user'

function parseJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(window.atob(base64))
  } catch {
    return null
  }
}

function tokenIsExpired(token) {
  const payload = parseJwtPayload(token)

  if (!payload) {
    return true
  }

  if (!payload.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!token || tokenIsExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)

    return {
      token: null,
      user: null,
    }
  }

  try {
    const user = storedUser ? JSON.parse(storedUser) : null

    return {
      token,
      user,
    }
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)

    return {
      token: null,
      user: null,
    }
  }
}

function UserProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

    setSession({
      token,
      user,
    })
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)

    setSession({
      token: null,
      user: null,
    })
  }

  const value = useMemo(() => ({
    token: session.token,
    user: session.user,
    isAuthenticated: Boolean(session.token),
    saveSession,
    clearSession,
  }), [session])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export { UserProvider }
