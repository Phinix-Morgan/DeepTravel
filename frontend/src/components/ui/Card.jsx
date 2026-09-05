import React, { forwardRef } from "react";

export const Card = forwardRef(function Card(
  {
    children,
    variant = "default",
    padding = "md",
    interactive = false,
    as: Component = "div",
    className = "",
    ...props
  },
  ref
) {
  const classes = [
    "dt-card",
    "dt-card--" + variant,
    "dt-card--padding-" + padding,
    interactive ? "dt-card--interactive" : "",
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

export default Card;
