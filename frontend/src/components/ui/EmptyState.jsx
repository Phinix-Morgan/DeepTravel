import React from "react";

export function EmptyState({
  icon = "✦",
  eyebrow = "DeepTravel",
  title = "No records found",
  description,
  action,
  secondaryAction,
  className = "",
}) {
  return (
    <div className={("dt-empty-state " + className).trim()} role="region" aria-label={title}>
      {icon && (
        <div className="dt-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {eyebrow && <span className="eyebrow dt-empty-state__eyebrow">{eyebrow}</span>}
      <h3 className="dt-empty-state__title">{title}</h3>
      {description && <p className="dt-empty-state__description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="dt-empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
