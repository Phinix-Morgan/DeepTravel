import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const items = [["/admin", "Dashboard"], ["/admin/custom-trips", "Custom Trips"], ["/admin/destinations", "Destinations"], ["/admin/packages", "Packages"], ["/admin/departures", "Departures"], ["/admin/bookings", "Bookings"], ["/admin/payments", "Payments"], ["/admin/users", "Users"]];
export default function AdminLayout() {
  const [open, setOpen] = useState(false); const { logout, user } = useAuth(); const navigate = useNavigate();
  async function signOut() { await logout(); navigate("/", { replace: true }); }
  return <div className="admin-shell"><button type="button" className="admin-menu-toggle" onClick={() => setOpen(true)} aria-label="Open admin navigation">Menu</button><aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`} aria-label="Admin navigation"><button type="button" className="admin-sidebar__close" onClick={() => setOpen(false)} aria-label="Close admin navigation">×</button><Link className="admin-brand" to="/admin"><span>D</span> HUBSAFARI <small>Admin</small></Link><nav>{items.map(([to, label]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav><div className="admin-sidebar__footer"><span>{user?.name || "Administrator"}</span><Link to="/">View customer site</Link><Button variant="ghost" size="sm" onClick={signOut}>Log out</Button></div></aside>{open && <button type="button" className="admin-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}<main className="admin-main"><Outlet /></main></div>;
}
