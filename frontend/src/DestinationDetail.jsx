import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-600 font-bold ml-1">{rating?.toFixed(1)}</span>
      <span className="text-slate-400 text-sm">(Reviews)</span>
    </div>
  );
}

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Trip planning state
  const [travelers, setTravelers] = useState(2);
  const [nights, setNights] = useState(5);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/destinations/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setDestination(data);
      } catch (err) {
        setError("Destination not found.");
      } finally {
        setLoading(false);
      }
    };

    // Check if already saved
    const checkSaved = async () => {
      if (user && token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const trips = await res.json();
          const isSaved = trips.some((t) => (t.destination?._id || t.destination) === id);
          setSaved(isSaved);
        } catch {}
      }
    };

    fetchDestination();
    checkSaved();
  }, [id, user, token]);

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinationId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setSaveMsg("✅ Trip saved to dashboard!");
      } else {
        setSaveMsg(`⚠️ ${data.msg}`);
      }
    } catch {
      setSaveMsg("❌ Network error.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 4000);
    }
  };

  const totalCost = destination ? destination.pricePerNight * nights * travelers : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Destination Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/explore" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition"
        >
          ← Back
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            {destination.category && (
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold rounded-lg mb-3">
                {destination.category}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2">{destination.name}</h1>
            <div className="flex items-center gap-3 text-white/80 mb-4">
              <span className="text-lg">📍 {destination.country}</span>
            </div>
            {destination.rating && <StarRating rating={destination.rating} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-4">About This Destination</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{destination.description}</p>
            </div>

            {/* Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Top Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-slate-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {destination.bestTime && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                  <div className="text-3xl mb-2">🗓️</div>
                  <h3 className="font-bold text-slate-900 mb-1">Best Time</h3>
                  <p className="text-slate-500 text-sm">{destination.bestTime}</p>
                </div>
              )}
              {destination.weather && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                  <div className="text-3xl mb-2">🌤️</div>
                  <h3 className="font-bold text-slate-900 mb-1">Climate</h3>
                  <p className="text-slate-500 text-sm">{destination.weather}</p>
                </div>
              )}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold text-slate-900 mb-1">Price From</h3>
                <p className="text-slate-500 text-sm">${destination.pricePerNight}/night</p>
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-black text-slate-900">
                  ${destination.pricePerNight}
                  <span className="text-lg font-normal text-slate-400"> / night</span>
                </div>
                {destination.rating && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="font-bold text-slate-700 text-sm">{destination.rating?.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Trip Calculator */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Number of Nights
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-black text-xl text-slate-900">{nights}</span>
                    <button
                      onClick={() => setNights(nights + 1)}
                      className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Travelers
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-black text-xl text-slate-900">{travelers}</span>
                    <button
                      onClick={() => setTravelers(travelers + 1)}
                      className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>${destination.pricePerNight} × {nights} nights × {travelers} travelers</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">${totalCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Save Button */}
              {saveMsg && (
                <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm font-semibold rounded-xl text-center border border-green-100">
                  {saveMsg}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full py-4 font-black text-lg rounded-2xl transition-all ${
                  saved
                    ? "bg-green-500 text-white cursor-default"
                    : saving
                    ? "bg-blue-400 text-white cursor-wait"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                }`}
              >
                {saved ? "✓ Saved to Dashboard" : saving ? "Saving..." : user ? "Save to My Trips" : "Login to Save"}
              </button>

              {!user && (
                <p className="text-center text-sm text-slate-400 mt-3">
                  <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Log in
                  </Link>{" "}
                  to save this trip
                </p>
              )}

              {/* Share */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="w-full mt-3 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition text-sm"
              >
                🔗 Share Destination
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}