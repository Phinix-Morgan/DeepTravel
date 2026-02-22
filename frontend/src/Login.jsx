import { useState, useContext } from "react"; // <--- 1. Imported useContext
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // <--- 2. Imported AuthContext

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // <--- 3. Tapped into the global brain

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // <--- 4. Used the smart login function instead of localStorage!
        login(data.token);
        setMessage("✅ Success: Logged in! Redirecting...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setMessage("❌ Error: " + (data.error || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Network Error: Is the backend running?");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100"
      >
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-slate-900 inline-block mb-6 hover:opacity-80 transition"
          >
            Deep<span className="text-blue-600">Travel</span>.
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-500">Log in to your account</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            Log In
          </button>
        </div>

        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-center text-sm font-semibold ${message.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-blue-600 hover:text-blue-500 transition"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
