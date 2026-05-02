import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";

export default function Admin() {
  const { user, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    description: "",
    imageUrl: "",
    pricePerNight: "",
    category: "City",
    rating: "4.5",
    highlights: "",
    bestTime: "",
    weather: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("add");

  const CATEGORIES = ["City", "Beach", "Mountain", "Nature", "Historical", "Desert", "Island"];

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDestinations();
    }
  }, [user]);

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations`);
      const data = await res.json();
      setDestinations(data);
    } catch {}
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center pt-20">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🛑</div>
          <h1 className="text-4xl font-black text-red-600 mb-4">Access Denied</h1>
          <p className="text-lg text-slate-500 mb-8">
            You don't have permission to view the Admin Control Panel.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition"
          >
            ← Return to Safety
          </Link>
        </div>
      </div>
    );
  }

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        rating: Number(formData.rating),
        highlights: formData.highlights
          ? formData.highlights.split(",").map((h) => h.trim()).filter(Boolean)
          : [],
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showMsg("✅ Destination published successfully!", "success");
        setFormData({
          name: "", country: "", description: "", imageUrl: "",
          pricePerNight: "", category: "City", rating: "4.5",
          highlights: "", bestTime: "", weather: "",
        });
        fetchDestinations();
      } else {
        const data = await response.json();
        showMsg("❌ Error: " + (data.error || data.msg || "Failed to save"), "error");
      }
    } catch {
      showMsg("❌ Network error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDestinations((prev) => prev.filter((d) => d._id !== id));
        showMsg("✅ Destination deleted.", "success");
      } else {
        showMsg("❌ Failed to delete destination.", "error");
      }
    } catch {
      showMsg("❌ Network error.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations/seed`, {
        method: "POST",
      });
      const data = await res.json();
      showMsg(data.msg, res.ok ? "success" : "error");
      if (res.ok) fetchDestinations();
    } catch {
      showMsg("❌ Network error.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold rounded-full text-xs mb-3">
                ⚡ ADMIN MODE
              </span>
              <h1 className="text-4xl font-black mb-1">Control Panel</h1>
              <p className="text-white/50">Manage DeepTravel platform content</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-black">{destinations.length}</div>
                <div className="text-white/50 text-sm">Destinations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl font-semibold flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "add"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            ➕ Add Destination
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "manage"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🗂️ Manage ({destinations.length})
          </button>
          <button
            onClick={handleSeed}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all ml-auto"
          >
            🌱 Seed DB
          </button>
        </div>

        {/* Add Form */}
        {activeTab === "add" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Publish New Destination</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Destination Name *</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g., Eiffel Tower" required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country *</label>
                  <input
                    type="text" name="country" value={formData.country} onChange={handleChange}
                    placeholder="e.g., France" required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price Per Night ($) *</label>
                  <input
                    type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange}
                    placeholder="150" required min="1"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                  <select
                    name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rating (0-5)</label>
                  <input
                    type="number" name="rating" value={formData.rating} onChange={handleChange}
                    placeholder="4.5" min="0" max="5" step="0.1"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Best Time to Visit</label>
                  <input
                    type="text" name="bestTime" value={formData.bestTime} onChange={handleChange}
                    placeholder="e.g., June-August"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Climate/Weather</label>
                  <input
                    type="text" name="weather" value={formData.weather} onChange={handleChange}
                    placeholder="e.g., Mediterranean"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Image URL *</label>
                  <input
                    type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                    placeholder="https://images.unsplash.com/..." required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Highlights
                  <span className="text-slate-400 font-normal ml-2 text-xs">comma-separated</span>
                </label>
                <input
                  type="text" name="highlights" value={formData.highlights} onChange={handleChange}
                  placeholder="Eiffel Tower, Louvre Museum, Notre Dame"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  rows="4" placeholder="Describe the experience..." required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-40">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-lg rounded-2xl hover:from-purple-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                {loading ? "Publishing..." : "🚀 Publish to Explore Page"}
              </button>
            </form>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">All Destinations</h2>
              <p className="text-slate-400 text-sm">{destinations.length} destinations in database</p>
            </div>

            {destinations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-slate-500 font-semibold">No destinations yet. Add some above or seed the DB!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {destinations.map((dest) => (
                  <div key={dest._id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-slate-900 truncate">{dest.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium flex-shrink-0">
                          {dest.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        📍 {dest.country} • ${dest.pricePerNight}/night
                        {dest.rating && ` • ★ ${dest.rating}`}
                      </p>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">{dest._id}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        to={`/explore/${dest._id}`}
                        className="px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(dest._id)}
                        disabled={deletingId === dest._id}
                        className="px-3 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition border border-red-100 text-sm disabled:opacity-50"
                      >
                        {deletingId === dest._id ? "..." : "🗑️"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}