import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
   const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async(name, email, password) => {
    try {
      const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name : name,
        email: email,
        password: password
      })
    });
    const data = await response.json();
    if(response.ok){
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);
      setIsSuccess(true);
      navigate("/");
    } else {
      setMessage(data.message);
      setIsSuccess(false);
    }
    } catch (error) {
      console.log(error);
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
                <div className="text-2xl font-semibold tracking-wide">TRAFFIC MANAGEMENT</div>
                <div className="text-2xl font-semibold tracking-wide">SYSTEM</div>
              </div>
            </div>

            {/* Login Title */}
            <h1 className="text-white text-xl font-normal mb-8">SIGNUP</h1>

            {/* Name Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white placeholder-gray-400"
                placeholder=""
                required
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white placeholder-gray-400"
                placeholder=""
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Password</label>
              <input
              required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white placeholder-gray-400"
                placeholder=""
              />
            </div>

            

            {/* Signup Button */}
            <button
              onClick={() => handleSignup(name, email, password)}
              className="w-full bg-red-600 hover:bg-green-700 text-white py-2.5 px-6 rounded text-sm font-semibold transition-colors duration-600 mb-6"
            >
              Signup
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
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <button className="text-blue-400 hover:text-blue-300 text-sm" onClick={()=>{navigate("/Login");}}>
                Login
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
          >
          </div>
        </div>
      </div>
    </div>
  );
}