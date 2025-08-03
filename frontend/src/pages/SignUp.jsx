import React, { useContext, useState } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import { BsSun, BsMoon } from "react-icons/bs";
import axios from "axios";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [darkMode, setDarkMode] = useState(true); // Light/Dark toggle

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        name, email, password
      }, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      navigate("/customize");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setErr(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center relative overflow-hidden transition-all duration-500"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #080d1a, #0b1121)"
          : "linear-gradient(135deg, #f0f4ff, #ffffff)"
      }}
    >
      
      <div className="absolute top-5 right-5 text-white z-20">
        {darkMode ? (
          <BsSun className="w-6 h-6 cursor-pointer text-yellow-300" onClick={() => setDarkMode(false)} />
        ) : (
          <BsMoon className="w-6 h-6 cursor-pointer text-gray-800" onClick={() => setDarkMode(true)} />
        )}
      </div>

      
      {darkMode && (
        <>
          <div className="absolute w-72 h-72 bg-white/10 rounded-full top-16 left-10 blur-[120px] animate-pulse"></div>
          <div className="absolute w-60 h-60 bg-white/10 rounded-full bottom-20 right-10 blur-[100px] animate-pulse"></div>
        </>
      )}

      {/* Sign Up Form */}
      <form
        onSubmit={handleSignUp}
        className={`relative z-10 w-[90%] max-w-md ${
          darkMode
            ? "bg-white/5 border-white/10 text-white"
            : "bg-white border-gray-200 text-black"
        } backdrop-blur-lg rounded-2xl shadow-xl p-10 border flex flex-col gap-6 transition-all duration-500`}
      >
        <h2 className="text-center text-3xl font-semibold tracking-wide">
          SIGNUP
        </h2>
        <p className={`text-center text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Hello, There!
        </p>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          className={`w-full h-12 rounded-md px-4 placeholder-gray-400 focus:outline-none transition duration-300 ${
            darkMode
              ? "bg-[#1b1f2a] text-white border border-white/20 focus:border-white"
              : "bg-gray-100 text-black border border-gray-300 focus:border-gray-800"
          }`}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="email@domain.com"
          className={`w-full h-12 rounded-md px-4 placeholder-gray-400 focus:outline-none transition duration-300 ${
            darkMode
              ? "bg-[#1b1f2a] text-white border border-white/20 focus:border-white"
              : "bg-gray-100 text-black border border-gray-300 focus:border-gray-800"
          }`}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password@123"
            className={`w-full h-12 rounded-md px-4 pr-10 placeholder-gray-400 focus:outline-none transition duration-300 ${
              darkMode
                ? "bg-[#1b1f2a] text-white border border-white/20 focus:border-white"
                : "bg-gray-100 text-black border border-gray-300 focus:border-gray-800"
            }`}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <IoEyeOff
              className={`absolute top-3.5 right-3 cursor-pointer ${
                darkMode ? "text-white" : "text-black"
              }`}
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <IoEye
              className={`absolute top-3.5 right-3 cursor-pointer ${
                darkMode ? "text-white" : "text-black"
              }`}
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {/* Error */}
        {err && <p className="text-red-500 text-sm -mt-2">* {err}</p>}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full h-11 mt-2 font-semibold rounded-md transition duration-300 ${
            darkMode
              ? "bg-[#1f2937] hover:bg-[#374151] text-white"
              : "bg-gray-800 hover:bg-black text-white"
          }`}
        >
          {loading ? "Signing Up..." : "SIGNUP"}
        </button>

        <p className={`text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className={`font-medium hover:underline cursor-pointer ${
              darkMode ? 'text-white' : 'text-black'
            }`}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
