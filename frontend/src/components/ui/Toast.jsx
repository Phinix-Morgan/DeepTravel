import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4500 }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      const toast = { id, type, title, message };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toastMethods = {
    toast: addToast,
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message }),
    warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
    info: (message, title = "Notice") => addToast({ type: "info", title, message }),
    dismiss: removeToast,
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return "✓";
      case "error": return "⚠";
      case "warning": return "⚡";
      case "info":
      default: return "✦";
    }
  };

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      {toasts.length > 0 && (
        <div className="dt-toast-container" aria-live="polite" role="region" aria-label="Notifications">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={"dt-toast dt-toast--" + t.type}
              role={t.type === "error" ? "alert" : "status"}
            >
              <span className="dt-toast__icon" aria-hidden="true">
                {getIcon(t.type)}
              </span>
              <div className="dt-toast__content">
                {t.title && <h4 className="dt-toast__title">{t.title}</h4>}
                {t.message && <p className="dt-toast__message">{t.message}</p>}
              </div>
              <button
                type="button"
                className="dt-toast__close"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
