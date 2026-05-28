import api from './api'

async function loginUser(payload) {
  const response = await api.post('/auth/login', payload)

  return response.data.data
}

async function registerUser(payload) {
  const response = await api.post('/auth/register', payload)

  return response.data.data.user
}

export {
  loginUser,
  registerUser,
}
