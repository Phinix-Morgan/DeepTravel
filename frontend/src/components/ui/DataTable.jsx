import React from "react";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import Button from "./Button";

export function DataTable({
  columns = [],
  data = [],
  keyField = "id",
  loading = false,
  emptyMessage = "No data available",
  emptyDescription = "There are no entries to display at this time.",
  sortColumn,
  sortDirection = "asc",
  onSort,
  pagination,
  onRowClick,
  className = "",
}) {
  const totalColumns = columns.length;
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const currentPage = pagination?.currentPage || 1;

  return (
    <div className={("dt-table-container " + className).trim()}>
      <table className="dt-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortColumn === col.key;
              const isSortable = Boolean(col.sortable && onSort);

              const sortLabel = isSorted
                ? sortDirection === "asc"
                  ? "Sorted ascending"
                  : "Sorted descending"
                : `Sort by ${col.title}`;

              return (
                <th
                  key={col.key}
                  scope="col"
                  style={{
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                  aria-sort={
                    isSorted
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {isSortable ? (
                    <button
                      type="button"
                      className="dt-table__sort-button"
                      onClick={() => onSort(col.key)}
                      aria-label={sortLabel}
                    >
                      <span>{col.title}</span>
                      <span
                        aria-hidden="true"
                        className="dt-table__sort-icon"
                        style={{ opacity: isSorted ? 1 : 0.4 }}
                      >
                        {isSorted
                          ? sortDirection === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    <span>{col.title}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={"skeleton-row-" + rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={"skeleton-cell-" + colIdx}>
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={totalColumns}
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <EmptyState
                  title={emptyMessage}
                  description={emptyDescription}
                />
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowKey = row[keyField] || row._id || rowIdx;

              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align || "left",
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="dt-table-pagination">
          <div>
            Showing Page <strong>{currentPage}</strong> of{" "}
            <strong>{totalPages}</strong>
            {pagination.totalItems !== undefined && (
              <span> ({pagination.totalItems} total entries)</span>
            )}
          </div>

          <div className="dt-table-pagination__buttons">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => pagination.onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => pagination.onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
