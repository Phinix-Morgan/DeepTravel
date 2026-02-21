import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // <--- 1. Import useNavigate
import { AuthContext } from "./AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // <--- 2. Initialize the teleporter

  // <--- 3. Create a smart logout function
  const handleLogout = () => {
    logout(); // Clear the data
    navigate("/login"); // Teleport them away immediately!
  };

  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="text-2xl font-extrabold tracking-tighter text-slate-900">
        <Link to="/">
          Deep<span className="text-blue-600">Travel</span>.
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/explore"
          className="font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          Explore
        </Link>

        {user ? (
          <>
            <span className="font-semibold text-slate-600 hidden sm:inline-block">
              Hi, {user.username}!
            </span>
            <Link
              to="/dashboard"
              className="font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/settings"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Settings
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full hover:bg-purple-200 transition"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout} // <--- 4. Use the new smart function here!
              className="bg-red-100 text-red-600 px-5 py-2 rounded-full font-semibold hover:bg-red-200 transition-all"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 hover:shadow-lg transition-all"
            >
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
