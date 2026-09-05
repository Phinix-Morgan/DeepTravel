import React, { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    id,
    name,
    type = "text",
    size = "md",
    error = false,
    disabled = false,
    leadingIcon = null,
    trailingIcon = null,
    className = "",
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);
  const isInvalid = ariaInvalid !== undefined ? ariaInvalid : hasError;

  const wrapperClasses = [
    "dt-input-wrapper",
    leadingIcon ? "dt-input-wrapper--leading-icon" : "",
    trailingIcon ? "dt-input-wrapper--trailing-icon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputClasses = [
    "dt-input",
    "dt-input--" + size,
    hasError ? "dt-input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {leadingIcon && (
        <span className="dt-input__leading-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={isInvalid ? "true" : "false"}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
      {trailingIcon && (
        <span className="dt-input__trailing-icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </div>
  );
});

export default Input;
