import React, { forwardRef } from "react";

export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon = null,
    iconPosition = "left",
    iconOnly = false,
    as: Component = "button",
    className = "",
    type = "button",
    ...props
  },
  ref
) {
  const isButton = Component === "button";
  const isDisabled = disabled || loading;

  const classes = [
    "dt-btn",
    "dt-btn--" + variant,
    "dt-btn--" + size,
    loading ? "dt-btn--loading" : "",
    iconOnly ? "dt-btn--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <span className="dt-btn__spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="dt-btn__icon dt-btn__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      {!iconOnly && children && <span>{children}</span>}
      {iconOnly && !loading && (
        <span className="dt-btn__icon" aria-hidden="true">
          {icon || children}
        </span>
      )}
      {!loading && icon && iconPosition === "right" && !iconOnly && (
        <span className="dt-btn__icon dt-btn__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  return (
    <Component
      ref={ref}
      className={classes}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={!isButton && isDisabled ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      type={isButton ? type : undefined}
      tabIndex={!isButton && isDisabled ? -1 : undefined}
      {...props}
    >
      {content}
    </Component>
  );
});

export default Button;
