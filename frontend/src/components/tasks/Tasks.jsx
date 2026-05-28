import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useToast from '../toast/useToast'
import useUser from '../../contexts/useUser'
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../../services/taskService'

const statusOptions = ['pending', 'in-progress', 'hold', 'done']
const taskStatuses = ['all', ...statusOptions]

const defaultForm = {
  title: '',
  description: '',
  status: 'pending',
  deadline: '',
}

const defaultPagination = {
  page: 1,
  limit: 5,
  total: 0,
  total_pages: 1,
}

const statusLabel = {
  all: 'All',
  pending: 'Pending',
  'in-progress': 'In Progress',
  hold: 'Hold',
  done: 'Done',
}

const statusClassName = {
  pending: 'border-[#f0cfcf] bg-[#fff7f7] text-[#840005]',
  'in-progress': 'border-[#e10009] bg-[#e10009] text-white',
  hold: 'border-[#d7c8c8] bg-[#f4eeee] text-[#572522]',
  done: 'border-[#840005] bg-[#fff1f2] text-[#840005]',
}

const statusAccentClassName = {
  pending: 'bg-[#ffb8bb]',
  'in-progress': 'bg-[#e10009]',
  hold: 'bg-[#a89595]',
  done: 'bg-[#840005]',
}

function deadlineIsValid(deadline) {
  if (!deadline) {
    return true
  }

  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = deadline.match(datePattern)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function getErrorMessage(error) {
  const message = error?.response?.data?.error?.message || error?.message

  if (!message) {
    return 'Something went wrong'
  }

  if (typeof message === 'object') {
    return Object.values(message).join(' ')
  }

  return message
}

function formatDeadline(deadline) {
  if (!deadline) {
    return '-'
  }

  return String(deadline).slice(0, 10)
}

function getDeadlineInputValue(deadline) {
  if (!deadline) {
    return ''
  }

  return String(deadline).slice(0, 10)
}

function getTaskForm(task) {
  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'pending',
    deadline: getDeadlineInputValue(task.deadline),
  }
}

function buildTaskPayload(taskForm) {
  return {
    title: taskForm.title.trim(),
    description: taskForm.description.trim() || null,
    status: taskForm.status,
    deadline: taskForm.deadline || null,
  }
}

function Tasks() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, token, clearSession } = useUser()
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState(defaultPagination)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [editForm, setEditForm] = useState(defaultForm)
  const [editFormErrors, setEditFormErrors] = useState({})
  const [editApiError, setEditApiError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deleteApiError, setDeleteApiError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.max(pagination.total_pages || 1, 1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)

    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let ignoreResult = false

    async function loadTasks() {
      if (!token) {
        setTasks([])
        setPagination(defaultPagination)
        setApiError('Please log in to load tasks from the backend.')
        return
      }

      setIsLoading(true)
      setApiError('')

      try {
        const params = {
          page,
          limit,
        }

        if (statusFilter !== 'all') {
          params.status = statusFilter
        }

        if (search) {
          params.search = search
        }

        const result = await getTasks(params)

        if (ignoreResult) {
          return
        }

        setTasks(result.tasks || [])
        setPagination(result.pagination || defaultPagination)
      } catch (error) {
        if (ignoreResult) {
          return
        }

        if (error?.response?.status === 401) {
          clearSession()
        }

        setTasks([])
        setPagination(defaultPagination)
        setApiError(getErrorMessage(error))
      } finally {
        if (!ignoreResult) {
          setIsLoading(false)
        }
      }
    }

    loadTasks()

    return () => {
      ignoreResult = true
    }
  }, [clearSession, limit, page, refreshKey, search, statusFilter, token])

  function validateTaskForm(taskForm) {
    const errors = {}

    if (!taskForm.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!statusOptions.includes(taskForm.status)) {
      errors.status = 'Invalid task status'
    }

    if (!deadlineIsValid(taskForm.deadline)) {
      errors.deadline = 'Deadline must use YYYY-MM-DD format'
    }

    return errors
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  async function handleCreateTask(event) {
    event.preventDefault()

    const errors = validateTaskForm(form)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (!token) {
      setApiError('Please log in before creating a task.')
      return
    }

    const payload = buildTaskPayload(form)

    setIsSaving(true)
    setApiError('')

    try {
      await createTask(payload)
      setForm(defaultForm)
      setPage(1)
      toast.success('Task created', 'Your task has been added to the workboard.')
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleStatusChange(status) {
    setStatusFilter(status)
    setPage(1)
  }

  function handleLimitChange(event) {
    setLimit(Number(event.target.value))
    setPage(1)
  }

  function openEditModal(task) {
    setTaskToEdit(task)
    setEditForm(getTaskForm(task))
    setEditFormErrors({})
    setEditApiError('')
  }

  function closeEditModal() {
    if (isUpdating) {
      return
    }

    setTaskToEdit(null)
    setEditForm(defaultForm)
    setEditFormErrors({})
    setEditApiError('')
  }

  function handleEditFormChange(event) {
    const { name, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setEditFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  async function handleUpdateTask(event) {
    event.preventDefault()
    setEditApiError('')

    const errors = validateTaskForm(editForm)
    setEditFormErrors(errors)

    if (Object.keys(errors).length > 0 || !taskToEdit) {
      return
    }

    setIsUpdating(true)

    try {
      await updateTask(taskToEdit.id, buildTaskPayload(editForm))
      setTaskToEdit(null)
      setEditForm(defaultForm)
      setPage(1)
      toast.success('Task updated', 'Your changes have been saved.')
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (error) {
      setEditApiError(getErrorMessage(error))
    } finally {
      setIsUpdating(false)
    }
  }

  function openDeleteModal(task) {
    setTaskToDelete(task)
    setDeleteApiError('')
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return
    }

    setTaskToDelete(null)
    setDeleteApiError('')
  }

  async function handleDeleteTask() {
    if (!taskToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteApiError('')

    try {
      await deleteTask(taskToDelete.id)
      setTaskToDelete(null)
      setPage(1)
      toast.success('Task deleted', 'The task has been removed.')
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (error) {
      setDeleteApiError(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  return (
    <main className="min-h-svh bg-[#fff7f7] bg-[linear-gradient(90deg,rgba(225,0,9,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(132,0,5,0.04)_1px,transparent_1px)] bg-[size:44px_44px] text-[#1c1717]">
      <header className="border-b border-[#f2d4d5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#e10009]">
              Workboard
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
              Task Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3 border border-[#f2d4d5] bg-[#fff7f7] px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-bold text-[#332b2b]">
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs text-[#7a6d6d]">
                {user?.email || 'No active session'}
              </p>
            </div>
            <button
              className="border border-[#e10009] px-4 py-2 text-sm font-extrabold text-[#e10009] transition hover:bg-[#e10009] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e10009]/30"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="h-fit border border-[#f2d4d5] bg-white shadow-[0_24px_70px_rgba(132,0,5,0.10)]">
          <div className="border-b border-[#f2d4d5] bg-[#fff1f2] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">Create Task</h2>
              <span className="border border-[#e10009] px-2.5 py-1 text-xs font-black text-[#e10009]">
                NEW
              </span>
            </div>
          </div>

          <form className="grid gap-4 p-5" onSubmit={handleCreateTask}>
            <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="task-title">
              Title
              <input
                className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="task-title"
                name="title"
                placeholder="Example: Follow up material"
                type="text"
                value={form.title}
                onChange={handleFormChange}
              />
              {formErrors.title && (
                <span className="text-xs font-bold text-[#e10009]">{formErrors.title}</span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="task-description">
              Description
              <textarea
                className="min-h-28 resize-y border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="task-description"
                name="description"
                placeholder="Additional notes"
                value={form.description}
                onChange={handleFormChange}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="task-status">
                Status
                <select
                  className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                  id="task-status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
                {formErrors.status && (
                  <span className="text-xs font-bold text-[#e10009]">{formErrors.status}</span>
                )}
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="task-deadline">
                Deadline
                <input
                  className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                  id="task-deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleFormChange}
                />
                {formErrors.deadline && (
                  <span className="text-xs font-bold text-[#e10009]">{formErrors.deadline}</span>
                )}
              </label>
            </div>

            <button
              className="mt-2 border border-[#e10009] bg-[#e10009] px-5 py-3.5 font-black text-white shadow-[6px_6px_0_#ffd3d5] transition hover:bg-[#840005] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e10009]/30"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Task'}
            </button>
          </form>
        </section>

        <section className="min-w-0">
          <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <h2 className="text-xl font-black">My Tasks</h2>
            </div>

            <form className="flex gap-2" onSubmit={handleSearchSubmit}>
              <input
                className="min-w-0 flex-1 border border-[#ead6d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="task-search"
                name="search"
                placeholder="Search task title"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button
                className="border border-[#e10009] bg-[#e10009] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#840005]"
                type="submit"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="status-filter">
              Filter Status
              <select
                className="min-w-44 border border-[#ead6d6] bg-white px-3.5 py-2.5 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="status-filter"
                value={statusFilter}
                onChange={(event) => handleStatusChange(event.target.value)}
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="task-limit">
              Per Page
              <select
                className="min-w-32 border border-[#ead6d6] bg-white px-3.5 py-2.5 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="task-limit"
                value={limit}
                onChange={handleLimitChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>

          {apiError && (
            <p className="mb-3 border border-[#ffd3d5] bg-white px-4 py-3 text-sm font-bold text-[#e10009]">
              {apiError}
            </p>
          )}

          <div className="overflow-hidden border border-[#f2d4d5] bg-white shadow-[0_24px_70px_rgba(132,0,5,0.10)]">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_150px] border-b border-[#f2d4d5] bg-[#fff1f2] px-4 py-3 text-xs font-black uppercase text-[#572522] max-md:hidden">
              <span>Task</span>
              <span>Status</span>
              <span>Deadline</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-[#f2d4d5]">
              {isLoading && (
                <div className="px-4 py-10 text-center text-sm font-bold text-[#7a6d6d]">
                  Loading tasks...
                </div>
              )}

              {!isLoading && tasks.length === 0 && (
                <div className="px-4 py-10 text-center text-sm font-bold text-[#7a6d6d]">
                  No matching tasks yet.
                </div>
              )}

              {!isLoading && tasks.map((task) => (
                <article
                  className="grid gap-3 px-4 py-4 transition hover:bg-[#fff7f7] md:grid-cols-[minmax(0,1fr)_120px_120px_150px] md:items-center"
                  key={task.id}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className={`mt-1 h-10 w-1 shrink-0 ${statusAccentClassName[task.status]}`} />
                    <div className="min-w-0">
                      <h3 className="font-black text-[#1c1717]">{task.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#6c6060]">
                        {task.description || '-'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex border px-2.5 py-1 text-xs font-black ${statusClassName[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#332b2b]">{formatDeadline(task.deadline)}</p>

                  <div className="flex gap-2">
                    <button
                      className="min-h-9 border border-[#ead6d6] bg-white px-3 text-sm font-bold text-[#572522] transition hover:border-[#e10009] hover:text-[#e10009]"
                      type="button"
                      onClick={() => openEditModal(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="min-h-9 border border-[#ffd3d5] px-3 text-sm font-bold text-[#e10009] transition hover:border-[#e10009] hover:bg-[#e10009] hover:text-white"
                      type="button"
                      onClick={() => openDeleteModal(task)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-[#6c6060] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Page {pagination.page || page} of {totalPages} · Total {pagination.total} tasks
            </p>

            <div className="flex gap-2">
              <button
                className="border border-[#ead6d6] bg-white px-3 py-2 font-bold text-[#572522] transition hover:border-[#e10009] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </button>
              <button
                className="border border-[#ead6d6] bg-white px-3 py-2 font-bold text-[#572522] transition hover:border-[#e10009] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1717]/50 px-4 py-6">
          <section
            aria-modal="true"
            className="max-h-full w-full max-w-xl overflow-y-auto border border-[#f2d4d5] bg-white shadow-[0_24px_80px_rgba(28,23,23,0.24)]"
            role="dialog"
          >
            <div className="border-b border-[#f2d4d5] bg-[#fff1f2] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#e10009]">Edit Task</p>
                  <h2 className="mt-1 text-xl font-black text-[#1c1717]">{taskToEdit.title}</h2>
                </div>
                <button
                  className="min-h-10 border border-[#ead6d6] bg-white px-3 text-sm font-black text-[#572522] transition hover:border-[#e10009] hover:text-[#e10009]"
                  type="button"
                  onClick={closeEditModal}
                >
                  Close
                </button>
              </div>
            </div>

            <form className="grid gap-4 p-5" onSubmit={handleUpdateTask}>
              {editApiError && (
                <p className="border border-[#ffd3d5] bg-white px-3 py-2 text-sm font-bold text-[#e10009]">
                  {editApiError}
                </p>
              )}

              <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="edit-task-title">
                Title
                <input
                  className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                  id="edit-task-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                />
                {editFormErrors.title && (
                  <span className="text-xs font-bold text-[#e10009]">{editFormErrors.title}</span>
                )}
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="edit-task-description">
                Description
                <textarea
                  className="min-h-28 resize-y border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                  id="edit-task-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="edit-task-status">
                  Status
                  <select
                    className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                    id="edit-task-status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.status && (
                    <span className="text-xs font-bold text-[#e10009]">{editFormErrors.status}</span>
                  )}
                </label>

                <label className="grid gap-2 text-sm font-bold text-[#332b2b]" htmlFor="edit-task-deadline">
                  Deadline
                  <input
                    className="border border-[#ead6d6] bg-[#fffdfd] px-3.5 py-3 outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                    id="edit-task-deadline"
                    name="deadline"
                    type="date"
                    value={editForm.deadline}
                    onChange={handleEditFormChange}
                  />
                  {editFormErrors.deadline && (
                    <span className="text-xs font-bold text-[#e10009]">{editFormErrors.deadline}</span>
                  )}
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  className="min-h-11 border border-[#ead6d6] bg-white px-4 text-sm font-black text-[#572522] transition hover:border-[#e10009] hover:text-[#e10009]"
                  type="button"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  className="min-h-11 border border-[#e10009] bg-[#e10009] px-4 text-sm font-black text-white transition hover:bg-[#840005] disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1717]/50 px-4 py-6">
          <section
            aria-modal="true"
            className="w-full max-w-md border border-[#f2d4d5] bg-white shadow-[0_24px_80px_rgba(28,23,23,0.24)]"
            role="dialog"
          >
            <div className="border-b border-[#f2d4d5] bg-[#fff1f2] px-5 py-4">
              <p className="text-xs font-black uppercase text-[#e10009]">Delete Task</p>
              <h2 className="mt-1 text-xl font-black text-[#1c1717]">Are you sure?</h2>
            </div>

            <div className="grid gap-4 p-5">
              <p className="text-sm leading-6 text-[#6c6060]">
                This will permanently delete "{taskToDelete.title}" from your task list.
              </p>

              {deleteApiError && (
                <p className="border border-[#ffd3d5] bg-white px-3 py-2 text-sm font-bold text-[#e10009]">
                  {deleteApiError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="min-h-11 border border-[#ead6d6] bg-white px-4 text-sm font-black text-[#572522] transition hover:border-[#e10009] hover:text-[#e10009]"
                  type="button"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  className="min-h-11 border border-[#e10009] bg-[#e10009] px-4 text-sm font-black text-white transition hover:bg-[#840005] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteTask}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default Tasks
