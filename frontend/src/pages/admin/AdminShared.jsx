import { Button, Input } from "../../components/ui";

export const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));
export const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
export const dateTime = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";
export function PageHeading({ eyebrow = "Hubsafari admin", title, description, action }) { return <header className="admin-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>; }
export function TableToolbar({ search, setSearch, filters }) { return <div className="admin-toolbar"><Input aria-label="Search records" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search…" />{filters}</div>; }
export function Pagination({ pagination, onChange }) { if (!pagination || pagination.totalPages <= 1) return null; return <div className="admin-pagination"><span>Page {pagination.page} of {pagination.totalPages}</span><div><Button size="sm" variant="secondary" disabled={pagination.page <= 1} onClick={() => onChange(pagination.page - 1)}>Previous</Button><Button size="sm" variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => onChange(pagination.page + 1)}>Next</Button></div></div>; }
export function Info({ label, children }) { return <div className="admin-info"><span>{label}</span><strong>{children || "—"}</strong></div>; }
