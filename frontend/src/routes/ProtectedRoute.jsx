import { Navigate, Outlet, useLocation } from 'react-router-dom'

import useUser from '../contexts/useUser'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated } = useUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
