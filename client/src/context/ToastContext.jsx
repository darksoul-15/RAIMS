import { createContext, useCallback, useRef, useState } from 'react';

export const ToastContext = createContext(null);

let nextId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((msg, d) => toast(msg, 'success', d), [toast]);
  const error   = useCallback((msg, d) => toast(msg, 'error',   d ?? 6000), [toast]);
  const info    = useCallback((msg, d) => toast(msg, 'info',    d), [toast]);
  const warning = useCallback((msg, d) => toast(msg, 'warning', d), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const STYLES = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-600', bg: 'bg-white border-emerald-200', text: 'text-ink-900', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  error:   { bar: 'bg-danger',      icon: 'text-danger',      bg: 'bg-white border-red-200',     text: 'text-ink-900', path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { bar: 'bg-amber-500',   icon: 'text-amber-600',   bg: 'bg-white border-amber-200',   text: 'text-ink-900', path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  info:    { bar: 'bg-blue-500',    icon: 'text-blue-600',    bg: 'bg-white border-blue-200',    text: 'text-ink-900', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex overflow-hidden rounded-lg border shadow-card-md ${s.bg} animate-in slide-in-from-bottom-2 duration-200`}
          >
            <div className={`w-1 shrink-0 ${s.bar}`} />
            <div className="flex flex-1 items-start gap-3 p-3">
              <svg className={`w-4 h-4 shrink-0 mt-0.5 ${s.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
              </svg>
              <p className={`flex-1 text-sm leading-snug ${s.text}`}>{t.message}</p>
              <button
                onClick={() => onDismiss(t.id)}
                className="text-ink-400 hover:text-ink-700 transition-colors ml-1 shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
