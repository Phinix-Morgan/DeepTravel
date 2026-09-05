import React from "react";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  completed: "Completed",
  reviewing: "Reviewing",
  quoted: "Quoted",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  scheduled: "Scheduled",
  open: "Open",
  full: "Full",
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
};

export function StatusBadge({
  status = "pending",
  label,
  size = "md",
  dot = true,
  className = "",
}) {
  const normalized = String(status || "").toLowerCase().trim();
  const displayLabel = label || STATUS_LABELS[normalized] || status;

  const classes = [
    "dt-badge",
    "dt-badge--size-" + size,
    "dt-badge--status-" + normalized,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {dot && <span className="dt-badge__dot" aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
