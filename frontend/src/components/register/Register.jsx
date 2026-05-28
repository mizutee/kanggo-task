import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { registerUser } from '../../services/authService'

const defaultForm = {
  name: '',
  email: '',
  password: '',
}

function getErrorMessage(error) {
  const message = error?.response?.data?.error?.message || error?.message

  if (!message) {
    return 'Registration failed'
  }

  if (typeof message === 'object') {
    return Object.values(message).join(' ')
  }

  return message
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateForm() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    return newErrors
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setApiError('')

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      navigate('/login', {
        replace: true,
        state: {
          message: 'Account created successfully. Please sign in.',
        },
      })
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#fff7f7] px-5 py-10">
      <section className="w-full max-w-[460px]" aria-label="Register form">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#e10009]">
            Task Platform
          </p>
          <h1 className="m-0 text-4xl font-extrabold leading-tight text-[#1c1717]">
            Workboard
          </h1>
          <p className="mx-auto mt-3 max-w-[360px] text-sm leading-6 text-[#6c6060]">
            Create an account to start tracking tasks and keeping deadlines visible.
          </p>
        </div>

        <div className="border-t-4 border-[#e10009] bg-white p-6 shadow-[0_18px_60px_rgba(132,0,5,0.12)] sm:p-8">
          <div className="mb-7">
            <h2 className="m-0 text-2xl font-extrabold leading-tight text-[#1c1717]">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-[#7a6d6d]">
              Fill in your details to access the workboard.
            </p>
          </div>

          <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
            {apiError && (
              <p className="border border-[#ffd3d5] bg-white px-3 py-2 text-sm font-bold text-[#e10009]">
                {apiError}
              </p>
            )}

            <label className="grid gap-2 text-left text-sm font-bold text-[#332b2b]" htmlFor="name">
              Name
              <input
                className="w-full border border-[#ead6d6] bg-white px-3.5 py-3 text-[#1c1717] outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="name"
                name="name"
                type="text"
                placeholder="Full name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="text-xs font-bold text-[#e10009]">{errors.name}</span>
              )}
            </label>

            <label className="grid gap-2 text-left text-sm font-bold text-[#332b2b]" htmlFor="email">
              Email
              <input
                className="w-full border border-[#ead6d6] bg-white px-3.5 py-3 text-[#1c1717] outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="text-xs font-bold text-[#e10009]">{errors.email}</span>
              )}
            </label>

            <label className="grid gap-2 text-left text-sm font-bold text-[#332b2b]" htmlFor="password">
              Password
              <input
                className="w-full border border-[#ead6d6] bg-white px-3.5 py-3 text-[#1c1717] outline-none transition focus:border-[#e10009] focus:ring-4 focus:ring-[#e10009]/10"
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="text-xs font-bold text-[#e10009]">{errors.password}</span>
              )}
            </label>

            <button
              className="mt-2 bg-[#e10009] px-5 py-3.5 font-extrabold text-white transition hover:bg-[#840005] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e10009]/30"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6c6060]">
            Already have an account?{' '}
            <Link className="font-extrabold text-[#e10009] no-underline hover:underline" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register
