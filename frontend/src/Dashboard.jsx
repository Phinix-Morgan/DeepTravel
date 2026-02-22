import { useEffect, useState, useContext } from "react"; // <--- 1. Imported useContext
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // <--- 2. Imported AuthContext

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { logout } = useContext(AuthContext); // <--- 3. Tapped into the global brain

  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Profile Data
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Session expired");
        const profileData = await profileRes.json();
        setUser(profileData);

        // 2. Fetch Trip Data
        const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Session expired. Please log in again.");
        logout(); // Use smart logout if there's an error
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate, logout]);

  const handleLogout = () => {
    logout(); // <--- 4. Used the smart logout function! Updates Navbar instantly.
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 font-bold text-slate-500">
        Loading your secure dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-10">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              Welcome back,{" "}
              <span className="text-blue-600">{user?.username}</span>! 🌍
            </h1>
            <p className="text-slate-500 font-mono text-sm">ID: {user?._id}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg font-semibold border border-red-100 mb-6">
            {error}
          </div>
        )}

        {/* My Trips Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            My Planned Trips
          </h2>

          {trips.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-slate-500 mb-4">
                You haven't planned any trips yet!
              </p>
              <Link
                to="/explore"
                className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Start Exploring
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={trip.destination.imageUrl}
                    alt={trip.destination.name}
                    className="w-1/3 object-cover"
                  />

                  <div className="p-5 flex flex-col justify-center w-2/3">
                    <h4 className="font-bold text-xl text-slate-800 mb-1">
                      {trip.destination.name}
                    </h4>
                    <p className="text-sm text-slate-500 mb-3">
                      📍 {trip.destination.country}
                    </p>
                    <div className="mt-auto">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Status: {trip.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
