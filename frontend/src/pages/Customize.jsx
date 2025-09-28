import React, { useContext, useRef, useState, useEffect } from "react";
import Card from "../components/Card";
import image1 from "../assets/robort1.png";
import image2 from "../assets/robort 2.png";
import image3 from "../assets/robort 3.png";
import image4 from "../assets/robort 4.png";
import image5 from "../assets/robort 5.png";
import image6 from "../assets/robort6.avif";
import image7 from "../assets/robort 7.avif";
import image8 from "../assets/robort 8.avif";
import image9 from "../assets/robort 9.avif";

import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();
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

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
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
        onClick={() => navigate("/")}
      />

      {/* Title */}
      <h1 className="mb-[40px] text-[32px] text-center animate-fadeIn font-bold gradient-text drop-shadow-lg">
        Select your <span className="text-highlight">Assistant Image</span>
      </h1>

      {/* Image Grid */}
      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px] animate-slideUp">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <Card image={image8} />
        <Card image={image9} />

        {/* Upload Option */}
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center transition-all duration-300 ${
            selectedImage == "input"
              ? "border-4 border-white shadow-2xl shadow-blue-950"
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageAddLine className="text-white w-[25px] h-[25px]" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {/* Next Button */}
      {selectedImage && (
        <button
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slideUp"
          onClick={() => navigate("/customize2")}
        >
          Next
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

export default Customize;
