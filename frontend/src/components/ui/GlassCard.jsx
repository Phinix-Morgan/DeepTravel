import React, { forwardRef } from "react";

export const GlassCard = forwardRef(function GlassCard(
  {
    children,
    padding = "md",
    interactive = false,
    as: Component = "div",
    className = "",
    ...props
  },
  ref
) {
  const classes = [
    "dt-glass-card",
    "dt-glass-card--padding-" + padding,
    interactive ? "dt-glass-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

export default GlassCard;
