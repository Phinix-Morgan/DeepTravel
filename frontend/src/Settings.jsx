import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, setUser, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to hold our form inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill the form when the component loads
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Saving changes...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Show the VIP pass!
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // <--- THE MAGIC: Instantly update the global brain! --->
        setUser(data); 
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage("❌ Error: " + (data.msg || "Could not update profile"));
      }
    } catch (error) {
      console.error("Update error:", error);
      setMessage("❌ Network error.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 font-bold text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-10 pt-24">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-500 mb-8">Update your personal details here.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Tokyo, Japan"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Short Bio
            </label>
            <textarea
              name="bio"
              rows="4"
              placeholder="Tell the world about your travel style..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            ></textarea>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-center text-sm font-semibold ${
                message.includes("✅")
                  ? "bg-green-100 text-green-700"
                  : message.includes("Saving")
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}