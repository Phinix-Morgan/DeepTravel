import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const isHomePage = location.pathname === "/";

  const navLinkClass = (path) => {
    const base =
      "relative font-semibold text-sm transition-all duration-200 px-1 py-0.5 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:transition-all after:duration-200";
    if (isActive(path)) {
      if (isHomePage && !scrolled)
        return `${base} text-white after:w-full after:bg-white`;
      return `${base} text-blue-600 after:w-full after:bg-blue-600`;
    }
    if (isHomePage && !scrolled)
      return `${base} text-white/80 hover:text-white after:w-0 hover:after:w-full after:bg-white`;
    return `${base} text-slate-600 hover:text-blue-600 after:w-0 hover:after:w-full after:bg-blue-600`;
  };

  const isLight = !isHomePage || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className={`text-xl font-black tracking-tight transition-colors ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          Deep<span className="text-blue-500">Travel</span>.
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/explore" className={navLinkClass("/explore")}>
            Explore
          </Link>
          {user && (
            <Link to="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>
          )}
          {user && (
            <Link to="/settings" className={navLinkClass("/settings")}>
              Settings
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={navLinkClass("/admin")}>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                ⚡ Admin
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div
                className={`flex items-center gap-2 text-sm font-semibold ${
                  isLight ? "text-slate-700" : "text-white/80"
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden lg:block">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isLight
                    ? "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isLight ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="w-5 h-5 flex flex-col justify-center gap-1">
            <span
              className={`block h-0.5 rounded-full transition-all ${isLight ? "bg-slate-700" : "bg-white"} ${
                mobileOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block h-0.5 rounded-full transition-all ${isLight ? "bg-slate-700" : "bg-white"} ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 rounded-full transition-all ${isLight ? "bg-slate-700" : "bg-white"} ${
                mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-2">
            <Link to="/explore" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2">
              🌍 Explore
              {isActive("/explore") && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </Link>
            {user && (
              <Link to="/dashboard" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2">
                📊 Dashboard
                {isActive("/dashboard") && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
              </Link>
            )}
            {user && (
              <Link to="/settings" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50">
                ⚙️ Settings
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" className="px-4 py-3 rounded-xl text-purple-700 font-semibold hover:bg-purple-50">
                ⚡ Admin Panel
              </Link>
            )}
            <div className="border-t border-slate-100 mt-2 pt-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 text-left"
                >
                  🚪 Log Out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 text-center">
                    Log In
                  </Link>
                  <Link to="/signup" className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 text-center">
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}