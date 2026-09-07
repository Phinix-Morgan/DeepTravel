import React, { useEffect, useId, useRef } from "react";

export function Modal({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnEsc = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer = null,
  className = "",
}) {
  const modalRef = useRef(null);
  const previousActiveRef = useRef(null);
  const previousOverflowRef = useRef("");
  const onCloseRef = useRef(onClose);
  const closeOnEscRef = useRef(closeOnEsc);

  const titleId = useId();
  const descriptionId = useId();

  // Keep the latest callback/options available without
  // causing the modal lifecycle effect to restart.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeOnEscRef.current = closeOnEsc;
  }, [closeOnEsc]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousActiveRef.current = document.activeElement;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = modalRef.current;

    // Focus the modal only when it actually opens.
    // Do not repeat this when the parent rerenders.
    if (modal) {
      modal.focus();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (closeOnEscRef.current) {
          event.stopPropagation();
          onCloseRef.current?.();
        }
        return;
      }

      if (event.key !== "Tab" || !modal) return;

      const focusableElements = modal.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
      window.removeEventListener("keydown", handleKeyDown);

      if (
        previousActiveRef.current &&
        typeof previousActiveRef.current.focus === "function"
      ) {
        previousActiveRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleBackdropClick(event) {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onCloseRef.current?.();
    }
  }

  const modalClassName = (
    "dt-modal dt-modal--" +
    size +
    " " +
    className
  ).trim();

  return (
    <div
      className="dt-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="dt-modal__header">
            <div className="dt-modal__title-group">
              {title && (
                <h2 id={titleId} className="dt-modal__title">
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id={descriptionId}
                  className="dt-modal__description"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                className="dt-modal__close"
                onClick={() => onCloseRef.current?.()}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="dt-modal__body">{children}</div>

        {footer && (
          <div className="dt-modal__footer">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
