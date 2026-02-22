import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext"; // <--- 1. Import the global brain

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // <--- 2. Get the logged-in user and their VIP token
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/destinations`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setDestinations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Could not load destinations. Is the backend running?");
        setLoading(false);
      });
  }, []);

  // <--- 3. The function to save a trip to the database
  const handleSaveTrip = async (destinationId) => {
    if (!user) {
      alert("Please log in to save a trip!");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Show the VIP pass!
        },
        body: JSON.stringify({ destinationId }), // Send the ID of the location
      });

      if (response.ok) {
        alert("✅ Trip saved successfully! Check your Dashboard.");
      } else {
        alert("❌ Failed to save trip.");
      }
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("❌ Network error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <p className="text-xl font-bold text-slate-500 animate-pulse">
          Loading world wonders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <p className="text-xl font-bold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-10 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Trending <span className="text-blue-600">Destinations</span>
          </h1>
          <p className="text-lg text-slate-600">
            Discover your next great adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div
              key={dest._id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-sm">
                  ${dest.pricePerNight} / night
                </div>
              </div>

              <div className="p-6 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {dest.name}
                  </h2>
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">
                  📍 {dest.country}
                </p>
                <p className="text-slate-600 text-sm mb-6 grow">
                  {dest.description}
                </p>

                {/* <--- 4. Updated the button to trigger the save function! */}
                <button
                  onClick={() => handleSaveTrip(dest._id)}
                  className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {user ? "Save to My Trips" : "Log in to Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
