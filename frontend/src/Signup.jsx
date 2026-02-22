import { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "", // Changed from 'name' to 'username'
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    try {
      // This sends the data to your Node/Express backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Success: " + (data.message || "User registered!"));
      } else {
        setMessage("❌ Error: " + (data.error || "Registration failed"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Network Error: Is the backend running?");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Join DeepTravel
        </h2>

        <input
          type="text"
          name="username" // Changed from 'name' to 'username'
          placeholder="Username" // Updated placeholder
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded text-black"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded text-black"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded text-black"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold transition"
        >
          Sign Up
        </button>

        {message && (
          <p className="mt-4 text-center text-sm font-semibold text-gray-800">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
