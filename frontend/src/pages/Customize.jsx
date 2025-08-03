import React, { useContext, useRef } from 'react';
import Card from '../components/Card';
import image1 from "../assets/robort1.png";
import image2 from "../assets/robort 2.png";
import image3 from "../assets/robort 3.png";
import image4 from "../assets/robort 4.png";
import image5 from "../assets/robort 5.png";
import image6 from "../assets/robort6.avif";
import image7 from "../assets/robort 7.avif";
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
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
    setSelectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // ✅ VISUAL + STRUCTURE: Return starts here
  return (
    <div className="w-full h-screen relative flex justify-center items-center flex-col p-5 overflow-hidden bg-black font-sans">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01010d] via-[#0b0b1d] to-[#0f1129] opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1a2b5a,_transparent)] opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#005577,_transparent)] opacity-20"></div>
        <div className="absolute w-full h-full animate-pulse bg-[radial-gradient(circle,_#00ffd522_0%,_transparent_70%)] opacity-10"></div>
      </div>

      {/* Back Button */}
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white cursor-pointer w-[28px] h-[28px] z-10 hover:text-[#00ffd5] transition"
        onClick={() => navigate("/")}
      />

      {/* Title */}
      <h1 className="text-white text-[32px] md:text-[36px] font-semibold text-center mb-10 z-10 drop-shadow-xl tracking-wide">
        Select your <span className="text-[#00ffd5] drop-shadow-[0_0_8px_#00ffd5]">Assistant Image</span>
      </h1>

      {/* Cards */}
      <div className="z-10 w-full max-w-[900px] flex justify-center items-center flex-wrap gap-5">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />

        {/* Upload Image */}
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#0d0d22] border-2 border-[#00ffd5aa] rounded-2xl overflow-hidden hover:shadow-[0_0_25px_#00ffd5aa] hover:border-white/40 cursor-pointer transition-all flex items-center justify-center ${
            selectedImage === "input"
              ? "border-4 border-[#00ffd5] shadow-2xl shadow-[#00ffd577]"
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageAddLine className="text-white w-[28px] h-[28px] opacity-80 hover:opacity-100" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full w-full object-cover" />
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
          className="z-10 min-w-[160px] h-[55px] mt-10 px-8 text-[#00ffd5] font-bold bg-[#111827] hover:bg-[#1e293b] rounded-full text-lg transition-all duration-300 shadow-md shadow-[#00ffd522] hover:shadow-lg hover:shadow-[#00ffd5aa]"
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
}

export default Customize;
