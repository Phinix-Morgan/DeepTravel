import { useEffect, useState, useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Explore from "./Explore";
import Navbar from "./Navbar"; // <--- 1. Import the new Navbar
import Settings from "./Settings";
import Admin from "./Admin";
import { AuthContext } from "./AuthContext";

function Home() {
  const [message, setMessage] = useState("Connecting...");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Connection error:", err);
        setMessage("Offline mode");
      });
  }, []);

  return (
    // Removed the min-h-screen here so the Navbar doesn't get pushed down weirdly
    <div className="bg-slate-50 font-sans selection:bg-blue-200">
      {/* Hero Section (Notice the Navbar code is completely gone from here!) */}
      <main className="flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-5xl mx-auto h-[80vh]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 mb-8">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${message.includes("Hello") ? "bg-green-400" : "bg-amber-400"}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${message.includes("Hello") ? "bg-green-500" : "bg-amber-500"}`}
            ></span>
          </span>
          <span className="text-sm font-medium text-slate-600">
            System: {message}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Explore the world, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
            intelligently.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
          Your AI-powered journey begins here. Connect with global explorers,
          plan seamless trips, and experience the future of travel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            {user ? "Go to Dashboard" : "Start Your Journey"}
          </Link>
          <Link
            to="/about"
            className="flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 hover:shadow-md transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  );
}

function About() {
  return (
    <div className="p-10 text-center min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        About DeepTravel
      </h1>
      <p className="mb-8 text-slate-600">
        We are revolutionizing how people explore the planet.
      </p>
      <Link
        to="/"
        className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-slate-800 transition shadow-md"
      >
        ← Back Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* <--- 2. The Navbar sits OUTSIDE the Routes so it appears everywhere! ---> */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
