import React, { useContext, useState } from 'react';
import bg from "../assets/authBg.png"; // Replace with your gradient image if needed
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
  const [darkMode, setDarkMode] = useState(true);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setErr(error.response.data.message);
    }
  };

  return (
    <div
      className={`w-full h-[100vh] bg-cover bg-no-repeat flex justify-center items-center relative transition-all duration-300`}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundColor: darkMode ? '#000000' : '#f2f2f2',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-5 right-5 text-white bg-[#0ff0ff2c] border border-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-cyan-400 hover:text-black transition-all duration-300 z-10"
      >
        {darkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
      </button>

      <form
        className={`w-[90%] max-w-[500px] h-[600px] rounded-2xl p-6 flex flex-col items-center justify-center gap-[20px] shadow-xl shadow-black transition-all duration-300 ${
          darkMode
            ? 'bg-[#0f0f0fa8] backdrop-blur-xl text-white'
            : 'bg-white text-black'
        }`}
        onSubmit={handleSignIn}
      >
        <h1 className='text-[30px] font-bold mb-[20px] drop-shadow-md'>
          Sign In to <span className='text-cyan-400'>Virtual Assistant</span>
        </h1>

        <input
          type="email"
          placeholder='Email'
          className={`w-full h-[55px] outline-none border px-[20px] rounded-full text-[16px] focus:ring-2 transition-all duration-200 ${
            darkMode
              ? 'bg-[#1a1a1a] border-cyan-400 text-white placeholder-gray-400 focus:ring-cyan-400'
              : 'bg-gray-100 border-gray-400 text-black placeholder-gray-600 focus:ring-blue-400'
          }`}
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div
          className={`w-full h-[55px] border rounded-full relative flex items-center px-[20px] transition-all duration-200 ${
            darkMode
              ? 'bg-[#1a1a1a] border-cyan-400 text-white'
              : 'bg-gray-100 border-gray-400 text-black'
          }`}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder='Password'
            className={`w-full h-full outline-none bg-transparent pr-[40px] ${
              darkMode
                ? 'text-white placeholder-gray-400'
                : 'text-black placeholder-gray-600'
            }`}
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword ? (
            <IoEye
              className={`absolute right-[15px] cursor-pointer ${
                darkMode ? 'text-white' : 'text-black'
              }`}
              size={22}
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <IoEyeOff
              className={`absolute right-[15px] cursor-pointer ${
                darkMode ? 'text-white' : 'text-black'
              }`}
              size={22}
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {err.length > 0 && (
          <p className='text-red-500 text-[16px] font-medium'>* {err}</p>
        )}

        <button
          className={`w-[160px] h-[50px] mt-[20px] font-semibold rounded-full text-[17px] transition-all duration-200 ${
            darkMode
              ? 'bg-gradient-to-r from-cyan-300 to-blue-400 text-black hover:opacity-90'
              : 'bg-blue-500 text-white hover:opacity-90'
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

        <p className={`text-[16px] mt-[10px] ${darkMode ? 'text-white' : 'text-black'}`}>
          Want to create a new account?{" "}
          <span
            className='text-cyan-400 hover:underline cursor-pointer'
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
