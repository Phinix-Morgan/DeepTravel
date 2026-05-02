import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const CATEGORIES = ["All", "City", "Beach", "Mountain", "Nature", "Historical", "Desert", "Island"];
const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Alphabetical" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-slate-600 ml-0.5">{rating?.toFixed(1)}</span>
    </div>
  );
}

function DestinationCard({ dest, onSave, saving, saved }) {
  const categoryColors = {
    City: "bg-blue-100 text-blue-700",
    Beach: "bg-cyan-100 text-cyan-700",
    Mountain: "bg-slate-100 text-slate-700",
    Nature: "bg-green-100 text-green-700",
    Historical: "bg-amber-100 text-amber-700",
    Desert: "bg-orange-100 text-orange-700",
    Island: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "220px" }}>
        <img
          src={dest.imageUrl}
          alt={dest.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-black text-slate-900 shadow-lg">
          ${dest.pricePerNight}
          <span className="text-slate-400 font-normal text-xs">/night</span>
        </div>

        {/* Category badge */}
        {dest.category && (
          <div
            className={`absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-bold ${
              categoryColors[dest.category] || "bg-slate-100 text-slate-700"
            }`}
          >
            {dest.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{dest.name}</h2>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-slate-400 text-sm">📍</span>
          <span className="text-sm font-semibold text-slate-500">{dest.country}</span>
        </div>

        {dest.rating && (
          <div className="mb-3">
            <StarRating rating={dest.rating} />
          </div>
        )}

        <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
          {dest.description}
        </p>

        {/* Highlights */}
        {dest.highlights && dest.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {dest.highlights.slice(0, 3).map((h) => (
              <span key={h} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/explore/${dest._id}`}
            className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors text-center"
          >
            View Details
          </Link>
          <button
            onClick={() => onSave(dest._id)}
            disabled={saving === dest._id || saved}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all border ${
              saved
                ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                : saving === dest._id
                ? "bg-blue-50 text-blue-500 border-blue-100 cursor-wait"
                : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600"
            }`}
          >
            {saved ? "✓ Saved" : saving === dest._id ? "Saving..." : "Save Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("");
  const [saving, setSaving] = useState(null);
  const [savedTrips, setSavedTrips] = useState(new Set());
  const [saveMessage, setSaveMessage] = useState("");

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeCategory !== "All") params.append("category", activeCategory);
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/destinations?${params}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      setError("Could not load destinations. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [activeCategory, sortBy]);

  // Fetch user's saved trips to mark them
  useEffect(() => {
    if (user && token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const ids = new Set(data.map((t) => t.destination?._id || t.destination));
          setSavedTrips(ids);
        })
        .catch(() => {});
    }
  }, [user, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  const handleSaveTrip = async (destinationId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSaving(destinationId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinationId }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedTrips((prev) => new Set([...prev, destinationId]));
        setSaveMessage("✅ Trip saved to your dashboard!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage(`⚠️ ${data.msg || "Failed to save trip"}`);
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      setSaveMessage("❌ Network error. Try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(null);
    }
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl mb-4 shimmer" />
          <div className="h-5 w-48 bg-slate-100 rounded-xl mb-12 shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 h-96 shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-bold text-red-500 mb-2">Connection Error</p>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={fetchDestinations}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Save notification */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 text-white font-semibold rounded-2xl shadow-2xl text-sm animate-bounce">
          {saveMessage}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold rounded-full text-sm mb-4">
              ✈️ DISCOVER THE WORLD
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                Adventure
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {destinations.length} curated destinations waiting for you
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destinations, countries..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 font-medium">
            {destinations.length === 0
              ? "No destinations found"
              : `Showing ${destinations.length} destination${destinations.length !== 1 ? "s" : ""}`}
            {activeCategory !== "All" && (
              <span className="ml-1">
                in <strong className="text-slate-700">{activeCategory}</strong>
              </span>
            )}
          </p>
          {!user && (
            <p className="text-sm text-slate-400">
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Log in
              </Link>{" "}
              to save trips
            </p>
          )}
        </div>

        {/* Grid */}
        {destinations.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">🌍</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">No destinations found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setSortBy("");
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                dest={dest}
                onSave={handleSaveTrip}
                saving={saving}
                saved={savedTrips.has(dest._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}