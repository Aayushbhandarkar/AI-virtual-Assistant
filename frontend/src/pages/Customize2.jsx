import React, { useContext, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

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

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
      setLoading(false);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full h-screen relative flex justify-center items-center flex-col p-5 overflow-hidden bg-black font-sans">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#02010a] via-[#0b0b1d] to-[#0f1129] opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1a2b5a,_transparent)] opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#005577,_transparent)] opacity-20"></div>
        <div className="absolute w-full h-full animate-pulse bg-[radial-gradient(circle,_#00ffd522_0%,_transparent_70%)] opacity-10"></div>
      </div>

      {/* Back Button */}
      <MdKeyboardBackspace
        className="absolute top-8 left-8 text-white cursor-pointer w-7 h-7 z-10 hover:text-[#00ffd5] transition"
        onClick={() => navigate("/customize")}
      />

      {/* Title */}
      <h1 className="text-white mb-10 text-[30px] md:text-[36px] font-semibold text-center z-10 drop-shadow-xl tracking-wide">
        Enter Your <span className="text-[#00ffd5] drop-shadow-[0_0_8px_#00ffd5]">Assistant Name</span>
      </h1>

      {/* Input Field */}
      <input
        type="text"
        placeholder="eg. Shifra"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-6 py-4 rounded-full text-[18px] backdrop-blur-md z-10"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {/* Button */}
      {assistantName && (
        <button
          className="z-10 min-w-[300px] h-[55px] mt-10 px-8 text-[#00ffd5] font-bold bg-[#111827] hover:bg-[#1e293b] rounded-full text-lg transition-all duration-300 shadow-md shadow-[#00ffd522] hover:shadow-lg hover:shadow-[#00ffd5aa]"
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {loading ? "Loading..." : "Finally Create Your Assistant"}
        </button>
      )}
    </div>
  );
}

export default Customize2;
