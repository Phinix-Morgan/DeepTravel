import React from "react";
import Skeleton from "./Skeleton";

export function SkeletonCard({
  variant = "general",
  lines = 3,
  imageHeight = "200px",
  className = "",
}) {
  return (
    <div className={("dt-skeleton-card " + className).trim()} aria-hidden="true">
      {variant !== "text-only" && (
        <Skeleton variant="rectangular" height={imageHeight} rounded="0.75rem" />
      )}
      <Skeleton variant="text" width="65%" height="1.4rem" />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          width={idx === lines - 1 ? "45%" : "100%"}
          height="0.9rem"
        />
      ))}
    </div>
  );
}

export default SkeletonCard;
