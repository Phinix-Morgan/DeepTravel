import { useEffect, useState, useContext } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Explore from "./Explore";
import Navbar from "./Navbar";
import Settings from "./Settings";
import Admin from "./Admin";
import DestinationDetail from "./DestinationDetail";
import { AuthContext } from "./AuthContext";

function Home() {
  const [message, setMessage] = useState("Connecting...");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/test`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Offline mode"));
  }, []);

  const features = [
    {
      icon: "🗺️",
      title: "Smart Trip Planning",
      desc: "AI-powered itineraries tailored to your preferences and travel style.",
    },
    {
      icon: "🌍",
      title: "Global Destinations",
      desc: "Explore hundreds of curated destinations across every continent.",
    },
    {
      icon: "💰",
      title: "Best Price Guarantee",
      desc: "Find the perfect accommodation at prices that fit your budget.",
    },
    {
      icon: "⭐",
      title: "Verified Reviews",
      desc: "Real reviews from real travelers to help you make the best choices.",
    },
  ];

  const stats = [
    { value: "500+", label: "Destinations" },
    { value: "50K+", label: "Happy Travelers" },
    { value: "120+", label: "Countries" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <div className="bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  message.includes("Hello") ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  message.includes("Hello") ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </span>
            <span className="text-sm font-medium text-white/80">
              {message.includes("Hello") ? "All systems operational" : "Connecting..."}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Explore the World,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Intelligently.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your premium travel companion for discovering breathtaking destinations, planning seamless
            journeys, and creating unforgettable memories.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/explore" : "/signup"}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-sky-400 hover:to-blue-500 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Start Exploring ✈️
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                My Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-full text-sm mb-4">
              WHY DEEP TRAVEL
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Travel Smarter, Not Harder
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              We combine cutting-edge technology with deep travel expertise to deliver an unmatched experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-white/60 mb-10">
            Join thousands of travelers who trust DeepTravel for their adventures.
          </p>
          <Link
            to={user ? "/explore" : "/signup"}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-sky-400 hover:to-blue-500 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            {user ? "Browse Destinations" : "Join For Free"} →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black text-white">
            Deep<span className="text-blue-400">Travel</span>.
          </div>
          <div className="flex gap-8 text-sm">
            <Link to="/explore" className="hover:text-white transition">Explore</Link>
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>
          <p className="text-sm">© 2025 DeepTravel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-6">
          About <span className="text-blue-600">DeepTravel</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          We are revolutionizing how people explore the planet. Our platform combines AI-powered
          recommendations with real traveler insights to help you discover your perfect destination.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-md"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:id" element={<DestinationDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}