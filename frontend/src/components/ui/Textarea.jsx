import React, { forwardRef } from "react";

export const Textarea = forwardRef(function Textarea(
  {
    id,
    name,
    rows = 4,
    error = false,
    disabled = false,
    className = "",
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref
) {
  const hasError = Boolean(error);
  const isInvalid = ariaInvalid !== undefined ? ariaInvalid : hasError;

  const classes = [
    "dt-textarea",
    hasError ? "dt-textarea--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      ref={ref}
      id={id}
      name={name}
      rows={rows}
      disabled={disabled}
      className={classes}
      aria-invalid={isInvalid ? "true" : "false"}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

export default Textarea;
