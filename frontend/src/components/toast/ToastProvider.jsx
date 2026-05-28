import { createContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)
const TOAST_DURATION = 3200

function createToastId() {
  return `${Date.now()}-${Math.random()}`
}

function ToastItem({ toast, onDismiss }) {
  const toneClassName = {
    success: 'border-[#e10009] bg-white text-[#1c1717]',
    error: 'border-[#e10009] bg-[#fff7f7] text-[#1c1717]',
    info: 'border-[#f2d4d5] bg-white text-[#1c1717]',
  }

  const accentClassName = {
    success: 'bg-[#e10009]',
    error: 'bg-[#840005]',
    info: 'bg-[#a89595]',
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration)

    return () => window.clearTimeout(timeout)
  }, [onDismiss, toast.duration, toast.id])

  return (
    <article
      className={`grid grid-cols-[4px_minmax(0,1fr)_32px] overflow-hidden border shadow-[0_18px_50px_rgba(132,0,5,0.16)] ${toneClassName[toast.type]}`}
      role="status"
    >
      <span className={accentClassName[toast.type]} />
      <div className="min-w-0 px-4 py-3">
        <p className="text-sm font-black text-[#1c1717]">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm leading-5 text-[#6c6060]">{toast.description}</p>
        )}
      </div>
      <button
        aria-label="Close notification"
        className="min-h-8 text-sm font-black text-[#7a6d6d] transition hover:bg-[#fff1f2] hover:text-[#e10009]"
        type="button"
        onClick={() => onDismiss(toast.id)}
      >
        x
      </button>
    </article>
  )
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function removeToast(toastId) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
  }

  function addToast(toast) {
    const nextToast = {
      id: createToastId(),
      type: toast.type || 'info',
      title: toast.title,
      description: toast.description || '',
      duration: toast.duration || TOAST_DURATION,
    }

    setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, 4))
  }

  const value = {
    success(title, description) {
      addToast({ type: 'success', title, description })
    },
    error(title, description) {
      addToast({ type: 'error', title, description })
    },
    info(title, description) {
      addToast({ type: 'info', title, description })
    },
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[80] grid w-[min(380px,calc(100vw-32px))] gap-3">
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <ToastItem toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export {
  ToastContext,
  ToastProvider,
}
