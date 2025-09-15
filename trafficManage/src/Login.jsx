import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // store token
        setIsSuccess(true)
        if (rememberMe) {
          sessionStorage.setItem("token", data.token);
          localStorage.setItem("name", data.user.name);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("name", data.user.name);
        }
        navigate("/"); // redirect to homepage/dashboard
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error fetching from backend:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Panel - Login */}
        <div className="flex-1 bg-[#131827] p-12">
          <div className="max-w-sm mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center mb-12">
              <div className="text-white">
                <div className="text-2xl font-semibold tracking-wide">
                  TRAFFIC MANAGEMENT
                </div>
                <div className="text-2xl font-semibold tracking-wide">
                  SYSTEM
                </div>
              </div>
            </div>

            {/* Login Title */}
            <h1 className="text-white text-xl font-normal mb-8">LOGIN</h1>

            {/* Email Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white placeholder-gray-400"
                placeholder=""
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white placeholder-gray-400"
                placeholder=""
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-transparent border border-gray-400 rounded-sm mr-3 focus:ring-0 focus:ring-offset-0 text-white"
              />
              <label htmlFor="remember" className="text-white text-sm">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-green-700 text-white py-2.5 px-6 rounded text-sm font-semibold transition-colors duration-600 mb-6"
            >
              LOGIN
            </button>
            {message && (
              <div
                className={`mb-4 text-sm ${
                  isSuccess ? "text-green-500" : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-gray-400 text-sm">
                Don't have an account?{" "}
              </span>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => {
                  navigate("/Signup");
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative min-h-96">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/map.png')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
