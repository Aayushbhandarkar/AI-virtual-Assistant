import React, { useContext, useState } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email,
        password
      });

      // ✅ Store token in localStorage for auth
      localStorage.setItem("token", result.data.token);

      // ✅ Set user data in context
      setUserData(result.data);

      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log("❌ Signin error:", error);
      setUserData(null);
      setLoading(false);
      setErr(error.response?.data?.message || "Sign In failed");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #080d1a, #0b1121)",
      }}
    >
      {/* Background blurred shapes */}
      <div className="absolute w-72 h-72 bg-white/10 rounded-full top-16 left-10 blur-[120px] animate-pulse"></div>
      <div className="absolute w-60 h-60 bg-white/10 rounded-full bottom-20 right-10 blur-[100px] animate-pulse"></div>

      {/* Sign In Form */}
      <form
        onSubmit={handleSignIn}
        className="relative z-10 w-[90%] max-w-md bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-10 border border-white/10 flex flex-col gap-6 text-white"
      >
        <h2 className="text-center text-3xl font-semibold tracking-wide">SIGN IN</h2>
        <p className="text-center text-lg text-gray-300">Welcome Back!</p>

        {/* Email */}
        <input
          type="email"
          placeholder="email@domain.com"
          className="w-full h-12 bg-[#1b1f2a] border border-white/20 rounded-md px-4 text-white placeholder-gray-400 focus:outline-none focus:border-white transition duration-300"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-12 bg-[#1b1f2a] border border-white/20 rounded-md px-4 text-white placeholder-gray-400 pr-10 focus:outline-none focus:border-white transition duration-300"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <IoEyeOff className="absolute top-3.5 right-3 text-white cursor-pointer" onClick={() => setShowPassword(false)} />
          ) : (
            <IoEye className="absolute top-3.5 right-3 text-white cursor-pointer" onClick={() => setShowPassword(true)} />
          )}
        </div>

        {/* Error */}
        {err && <p className="text-red-400 text-sm -mt-2">* {err}</p>}

        {/* Final Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 font-semibold rounded-md bg-[#1f2937] hover:bg-[#374151] transition duration-300 text-white"
        >
          {loading ? "Signing In..." : "SIGN IN"}
        </button>

        <p className="text-center text-sm text-gray-300">
          Want to create a new account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-white font-medium hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
