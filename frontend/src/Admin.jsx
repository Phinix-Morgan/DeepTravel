import { useState, useContext } from "react";
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
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚨 SECURITY CHECK: Kick out non-admins! 🚨
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <h1 className="text-4xl font-extrabold text-red-600 mb-4">
          🛑 Access Denied
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          You do not have clearance to view the Admin Control Panel.
        </p>
        <Link
          to="/"
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition"
        >
          Return to Safety
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Deploying new destination...");

    try {
      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass both Auth & Admin bouncers!
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("✅ Success: Destination is now live on the Explore page!");
        // Clear the form for the next entry
        setFormData({
          name: "",
          country: "",
          description: "",
          imageUrl: "",
          pricePerNight: "",
        });
      } else {
        const data = await response.json();
        setMessage("❌ Error: " + (data.error || data.msg || "Failed to save"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-10 pt-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
            God Mode Authorized
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            Admin Control Panel
          </h1>
          <p className="text-slate-600">Manage the DeepTravel platform data.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
            Add New Destination
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Destination Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Eiffel Tower"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., France"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Price Per Night ($)
                </label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  placeholder="e.g., 150"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the experience..."
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 mt-4 shadow-md hover:shadow-lg"
            >
              {loading ? "Publishing..." : "Publish to Explore Page"}
            </button>

            {message && (
              <div
                className={`p-4 rounded-lg text-center font-bold mt-4 ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
