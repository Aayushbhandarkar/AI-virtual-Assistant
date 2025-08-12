import React, { useContext, useState, useEffect } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Customize2() {
  const {
    userData,
    backendImage,
    selectedImage,
    serverUrl,
    setUserData
  } = useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(userData?.AssistantName || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 20; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        size: Math.random() * 5 + 2
      });
    }
    setParticles(particleArray);
  }, []);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setLoading(false);
      console.log(result.data);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[100vh] relative flex justify-center items-center flex-col p-[20px] overflow-hidden">
      
      {/* Darker Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-t from-black via-[#020230] to-[#0d0d50]"></div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bg-white rounded-full opacity-40 animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            width: `${p.size}px`,
            height: `${p.size}px`
          }}
        ></span>
      ))}

      {/* Back Button */}
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px] hover:scale-110 transition-transform duration-300"
        onClick={() => navigate("/customize")}
      />

      {/* Title */}
      <h1 className="mb-[40px] text-[32px] text-center animate-fadeIn font-bold gradient-text drop-shadow-lg">
        Enter Your <span className="text-highlight">Assistant Name</span>
      </h1>

      {/* Input Field */}
      <input
        type="text"
        placeholder="eg. Lion"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] animate-slideUp"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {/* Button */}
      {assistantName && (
        <button
          className="min-w-[300px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slideUp"
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {!loading ? "Finally Create Your Assistant" : "Loading..."}
        </button>
      )}

      {/* Animations & Styles */}
      <style jsx="true">{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 1s ease forwards;
        }
        .gradient-text {
          background: linear-gradient(90deg, #00c6ff, #0072ff, #00ff9d);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient 3s ease infinite;
        }
        .text-highlight {
          background: linear-gradient(90deg, #ff6a00, #ff0099);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient 3s ease infinite;
        }
        .drop-shadow-lg {
          text-shadow: 0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(0, 195, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

export default Customize2;
