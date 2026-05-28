import { useContext } from 'react'

import UserContext from './userContext'

function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used inside UserProvider')
  }

  return context
}

export default useUser
