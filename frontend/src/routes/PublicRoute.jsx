import { Navigate, Outlet } from 'react-router-dom'

import useUser from '../contexts/useUser'

function PublicRoute() {
  const { isAuthenticated } = useUser()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicRoute
