import React, { useId } from "react";

export function FormField({
  id: explicitId,
  label,
  required = false,
  helperText,
  error,
  className = "",
  children,
}) {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const errorId = error ? inputId + "-error" : undefined;
  const helperId = helperText ? inputId + "-helper" : undefined;

  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={("dt-form-field " + className).trim()}>
      {label && (
        <div className="dt-form-field__label-row">
          <label htmlFor={inputId} className="dt-form-field__label">
            {label}
            {required && <span className="dt-form-field__required" aria-hidden="true">*</span>}
          </label>
        </div>
      )}
      {typeof children === "function"
        ? children({
            id: inputId,
            error: Boolean(error),
            "aria-describedby": describedBy,
            "aria-invalid": Boolean(error),
          })
        : React.isValidElement(children)
        ? React.cloneElement(children, {
            id: children.props.id || inputId,
            error: children.props.error !== undefined ? children.props.error : Boolean(error),
            "aria-describedby": children.props["aria-describedby"] || describedBy,
            "aria-invalid": children.props["aria-invalid"] !== undefined ? children.props["aria-invalid"] : Boolean(error),
          })
        : children}
      {error && (
        <div id={errorId} className="dt-form-field__error" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <div id={helperId} className="dt-form-field__helper">
          {helperText}
        </div>
      )}
    </div>
  );
}

export default FormField;
