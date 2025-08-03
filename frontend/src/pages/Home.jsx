import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/aivoice.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text);
    utterence.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }

    isSpeakingRef.current = true;
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };

    synth.cancel();
    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    const query = encodeURIComponent(userInput);
    const openNewTab = (url) => window.open(url, '_blank');

    switch (type) {
      case 'google-search': openNewTab(`https://www.google.com/search?q=${query}`); break;
      case 'calculator-open': openNewTab(`https://www.google.com/search?q=calculator`); break;
      case 'instagram-open': openNewTab(`https://www.instagram.com/`); break;
      case 'facebook-open': openNewTab(`https://www.facebook.com/`); break;
      case 'weather-show': openNewTab(`https://www.google.com/search?q=weather`); break;
      case 'youtube-search':
      case 'youtube-play': openNewTab(`https://www.youtube.com/results?search_query=${query}`); break;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") console.error(e);
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
    window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  return (
    <div className='w-full h-screen bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

      {/* Mobile Menu */}
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
        <button className='min-w-[160px] h-[60px] bg-[#1f1f1f] text-white font-semibold rounded-full px-5 hover:bg-[#333] transition-all duration-300 shadow-md' onClick={handleLogOut}>✅ Log Out</button>
        <button className='min-w-[160px] h-[60px] bg-[#1f1f1f] text-white font-semibold rounded-full px-5 hover:bg-[#333] transition-all duration-300 shadow-md' onClick={() => navigate("/customize")}>🛠️ Customize My AI</button>
        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData.history?.map((his, idx) => (
            <div key={idx} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          ))}
        </div>
      </div>

      {/* LEFT SIDE BUTTONS (Desktop) */}
      <button
        className='min-w-[160px] h-[60px] absolute hidden lg:block top-[20px] left-[20px] text-white font-semibold bg-[#1e1e1e] hover:bg-[#2c2c2c] hover:scale-105 transition-all duration-300 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] backdrop-blur-lg'
        onClick={handleLogOut}
      >
        ✅ Log Out
      </button>

      <button
        className='min-w-[160px] h-[60px] absolute hidden lg:block top-[100px] left-[20px] text-white font-semibold bg-[#1e1e1e] hover:bg-[#2c2c2c] hover:scale-105 transition-all duration-300 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] backdrop-blur-lg'
        onClick={() => navigate("/customize")}
      >
        🛠️ Customize My AI
      </button>

      {/* Assistant Image */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-[30px] shadow-[0_0_30px_#0ff] bg-[#0c0c2e] border border-[#2a2a5c]'>
        <img src={userData?.assistantImage} alt="Assistant" className='h-full object-cover rounded-[30px]' />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>

      {/* AI Animation */}
      {!aiText && <img src={userImg} alt="User Input" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="AI Response" className='w-[200px]' />}

      {/* Text Display */}
      <h1 className='text-white text-[18px] font-semibold break-words text-center px-5'>{userText ? userText : aiText || null}</h1>
    </div>
  );
}

export default Home;
