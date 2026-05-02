import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const STATUS_OPTIONS = ["Planned", "Ongoing", "Completed", "Cancelled"];

const STATUS_STYLES = {
  Planned: "bg-blue-50 text-blue-600 border-blue-100",
  Ongoing: "bg-amber-50 text-amber-600 border-amber-100",
  Completed: "bg-green-50 text-green-600 border-green-100",
  Cancelled: "bg-red-50 text-red-600 border-red-100",
};

const STATUS_ICONS = {
  Planned: "📋",
  Ongoing: "✈️",
  Completed: "✅",
  Cancelled: "❌",
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 h-28">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function TripCard({ trip, onDelete, onStatusChange, deleting }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await onStatusChange(trip._id, newStatus);
    setUpdatingStatus(false);
  };

  const nights =
    trip.startDate && trip.endDate
      ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "180px" }}>
        <img
          src={trip.destination?.imageUrl}
          alt={trip.destination?.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[trip.status]}`}>
          {STATUS_ICONS[trip.status]} {trip.status}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-black text-slate-900">
          ${trip.destination?.pricePerNight}/night
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-black text-lg text-slate-900 mb-1 leading-tight">
          {trip.destination?.name}
        </h3>
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
          <span>📍</span> {trip.destination?.country}
        </p>

        {trip.notes && (
          <p className="text-xs text-slate-400 italic mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{trip.notes}"
          </p>
        )}

        {nights && (
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
            <span>🗓️</span>
            <span>{nights} nights</span>
          </div>
        )}

        {/* Status Selector */}
        <div className="mb-4 mt-auto">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
            Update Status
          </label>
          <select
            value={trip.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/explore/${trip.destination?._id}`}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition text-center"
          >
            View Details
          </Link>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition border border-red-100"
            >
              🗑️ Remove
            </button>
          ) : (
            <div className="flex-1 flex gap-1">
              <button
                onClick={() => onDelete(trip._id)}
                disabled={deleting === trip._id}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-500 transition disabled:opacity-50"
              >
                {deleting === trip._id ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { logout, user: ctxUser } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, tripsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) throw new Error("Session expired");
        const profileData = await profileRes.json();
        setUser(profileData);

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData);
        }
      } catch (err) {
        setError("Session expired. Redirecting...");
        logout();
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDelete = async (tripId) => {
    setDeleting(tripId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t._id !== tripId));
        showNotification("✅ Trip removed from dashboard");
      } else {
        showNotification("❌ Failed to delete trip");
      }
    } catch {
      showNotification("❌ Network error");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTrips((prev) => prev.map((t) => (t._id === tripId ? updated : t)));
        showNotification(`✅ Status updated to ${newStatus}`);
      }
    } catch {
      showNotification("❌ Failed to update status");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const filteredTrips =
    activeFilter === "All" ? trips : trips.filter((t) => t.status === activeFilter);

  // Stats
  const stats = {
    total: trips.length,
    planned: trips.filter((t) => t.status === "Planned").length,
    ongoing: trips.filter((t) => t.status === "Ongoing").length,
    completed: trips.filter((t) => t.status === "Completed").length,
  };

  const totalSpend = trips
    .filter((t) => t.destination?.pricePerNight)
    .reduce((acc, t) => acc + t.destination.pricePerNight * 5, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 text-white font-semibold rounded-2xl shadow-2xl text-sm">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-blue-300 text-sm font-semibold mb-1">Welcome back</p>
                <h1 className="text-3xl font-black text-white">{user?.username}</h1>
                <p className="text-white/50 text-sm">{user?.email}</p>
                {user?.location && (
                  <p className="text-white/40 text-xs mt-0.5">📍 {user.location}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/settings"
                className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition text-sm"
              >
                ⚙️ Settings
              </Link>
              <Link
                to="/explore"
                className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition text-sm shadow-lg shadow-blue-500/30"
              >
                + Add Trip
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500/20 border border-red-400/30 text-red-300 font-semibold rounded-xl hover:bg-red-500/30 transition text-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl font-semibold border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Stats Grid — all same size */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🗺️" label="Total Trips" value={stats.total} color="bg-blue-50" />
          <StatCard icon="📋" label="Planned" value={stats.planned} color="bg-indigo-50" />
          <StatCard icon="✈️" label="Ongoing" value={stats.ongoing} color="bg-amber-50" />
          <StatCard icon="✅" label="Completed" value={stats.completed} color="bg-green-50" />
        </div>

        {/* Trips Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900">My Trips</h2>
              <p className="text-slate-400 text-sm mt-0.5">{trips.length} trip{trips.length !== 1 ? "s" : ""} saved</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {["All", "Planned", "Ongoing", "Completed", "Cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === f
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                  {f !== "All" && (
                    <span className="ml-1 text-xs opacity-60">
                      ({trips.filter((t) => t.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-7xl mb-6">✈️</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">
                  {activeFilter === "All" ? "No trips yet!" : `No ${activeFilter} trips`}
                </h3>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                  {activeFilter === "All"
                    ? "Start planning your dream journey by exploring our destinations."
                    : `You have no trips with status "${activeFilter}" yet.`}
                </p>
                {activeFilter === "All" && (
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/30"
                  >
                    🌍 Explore Destinations
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    deleting={deleting}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            to="/explore"
            className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🌍</div>
            <div>
              <h3 className="font-bold text-slate-900">Explore More</h3>
              <p className="text-slate-400 text-sm">Discover new destinations</p>
            </div>
            <span className="ml-auto text-slate-400 group-hover:text-blue-500 transition">→</span>
          </Link>
          <Link
            to="/settings"
            className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚙️</div>
            <div>
              <h3 className="font-bold text-slate-900">Profile Settings</h3>
              <p className="text-slate-400 text-sm">Update your details</p>
            </div>
            <span className="ml-auto text-slate-400 group-hover:text-blue-500 transition">→</span>
          </Link>
          <div className="group bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">💰</div>
            <div>
              <h3 className="font-bold text-slate-900">Est. Budget</h3>
              <p className="text-slate-400 text-sm">${totalSpend.toLocaleString()} total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}