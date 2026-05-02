import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "account", label: "Account", icon: "🔐" },
];

export default function Settings() {
  const { user, setUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
      });
    }
  }, [user, token, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        showMsg("✅ Profile updated successfully!", "success");
      } else {
        showMsg("❌ " + (data.msg || "Could not update profile"), "error");
      }
    } catch {
      showMsg("❌ Network error.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto mb-3 shadow-lg">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-black text-slate-900 text-lg">{user.username}</h3>
              <p className="text-slate-400 text-sm">{user.email}</p>
              {user.location && (
                <p className="text-slate-400 text-xs mt-1">📍 {user.location}</p>
              )}
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role === "admin" ? "⚡ Admin" : "🌍 Traveler"}
              </span>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold transition-all border-b border-slate-50 last:border-0 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {message.text}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">👤</span>
                  Profile Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                      <input
                        type="text"
                        name="location"
                        placeholder="e.g., Tokyo, Japan"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Bio
                      <span className="text-slate-400 font-normal ml-2 text-xs">Tell others about your travel style</span>
                    </label>
                    <textarea
                      name="bio"
                      rows="4"
                      placeholder="I love exploring hidden gems and authentic local experiences..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">{formData.bio.length} characters</p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">🔐</span>
                  Account Details
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">User ID</p>
                    <p className="font-mono text-sm text-slate-600">{user._id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Account Role</p>
                    <p className="font-bold text-slate-700 capitalize">{user.role}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Member Since</p>
                    <p className="font-bold text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 p-6 border border-red-100 rounded-2xl bg-red-50">
                  <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-red-500 text-sm mb-4">
                    These actions are irreversible. Please be careful.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to log out from all devices?")) {
                        alert("Feature coming soon!");
                      }
                    }}
                    className="px-5 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-100 transition text-sm"
                  >
                    Log Out All Devices
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}