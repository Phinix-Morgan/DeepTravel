import React, { forwardRef } from "react";

export const Select = forwardRef(function Select(
  {
    id,
    name,
    options = [],
    placeholder,
    size = "md",
    error = false,
    disabled = false,
    className = "",
    children,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);
  const isInvalid = ariaInvalid !== undefined ? ariaInvalid : hasError;

  const selectClasses = [
    "dt-select",
    "dt-select--" + size,
    hasError ? "dt-select--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="dt-select-wrapper">
      <select
        ref={ref}
        id={id}
        name={name}
        disabled={disabled}
        className={selectClasses}
        aria-invalid={isInvalid ? "true" : "false"}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <span className="dt-select-chevron" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </div>
  );
});

export default Select;
