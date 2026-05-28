import api from './api'

async function getTasks(params) {
  const response = await api.get('/tasks', {
    params,
  })

  return response.data.data
}

async function createTask(payload) {
  const response = await api.post('/tasks', payload)

  return response.data.data.task
}

async function updateTask(taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload)

  return response.data.data.task
}

async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`)

  return response.data
}

export {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
}
