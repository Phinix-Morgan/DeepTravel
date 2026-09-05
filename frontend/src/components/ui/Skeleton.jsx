import React from "react";

export function Skeleton({
  variant = "text",
  width,
  height,
  rounded,
  animate = true,
  className = "",
  style = {},
  ...props
}) {
  const classes = [
    "dt-skeleton",
    "dt-skeleton--" + variant,
    animate ? "dt-skeleton--animate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyles = {
    width: width || (variant === "circular" ? height : undefined),
    height: height || (variant === "circular" ? width : undefined),
    borderRadius: rounded,
    ...style,
  };

  return (
    <div
      className={classes}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Skeleton; /* reusable shimmer loader */
