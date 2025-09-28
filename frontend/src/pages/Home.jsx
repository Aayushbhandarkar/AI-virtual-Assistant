import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import userImg from "../assets/user.gif"
import ProChatWidget from "../components/ProChatWidget";

// Import default images directly
import image1 from "../assets/robort1.png";

function Home() {
  const { 
    userData, 
    serverUrl, 
    setUserData, 
    getGeminiResponse, 
    selectedImage, 
    frontendImage,
    assistantImage // Use the assistantImage from context directly
  } = useContext(userDataContext)
  
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  // Use the assistantImage directly from context with fallback
  const currentAssistantImage = assistantImage || image1;

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start()
        console.log("Recognition requested to start")
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error)
        }
      }
    }
  }

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop()
      console.log("Recognition requested to stop")
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Stop error:", error)
      }
    }
  }

  const toggleListening = () => {
    if (isRecognizingRef.current) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN'
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN')
    if (hindiVoice) {
      utterence.voice = hindiVoice
    }

    isSpeakingRef.current = true
    utterence.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      setTimeout(() => {
        if (listening) {
          startRecognition()
        }
      }, 800)
    }

    synth.cancel()
    synth.speak(utterence)
  }

  const handleCommand = (data) => {
    console.log("🔄 Handling command:", data);
    
    if (!data || !data.response) {
      console.error("❌ Invalid data received");
      const errorMessage = "I didn't receive a valid response. Please try again.";
      speak(errorMessage);
      setAiText(errorMessage);
      return;
    }

    const { type, userInput, response } = data;
    
    // Check if it's an error response
    if (response.includes("trouble processing") || response.includes("Sorry") || response.includes("error") || response.includes("can't understand")) {
      console.warn("⚠️ Error response detected, using fallback");
      const fallbackResponse = `I heard you say "${userInput}". How can I help you with that?`;
      speak(fallbackResponse);
      setAiText(fallbackResponse);
      return;
    }

    speak(response);

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    }

    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank')
    }

    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank')
    }

    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank')
    }

    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank')
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognitionRef.current = recognition

    let isMounted = true

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (isMounted && !isSpeakingRef.current && listening) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              console.log("Recognition restarted")
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e)
            }
          }
        }, 1000)
      }
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error)
      isRecognizingRef.current = false
      setListening(false)
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current && listening) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              console.log("Recognition restarted after error")
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e)
            }
          }
        }, 1000)
      }
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("🎤 User said:", transcript);

      setAiText("")
      setUserText(transcript)
      recognition.stop()
      isRecognizingRef.current = false
      setListening(false)
      
      try {
        console.log("🔄 Getting Gemini response...");
        const data = await getGeminiResponse(transcript)
        console.log("📨 Response data:", data);
        
        if (data && data.response) {
          console.log("✅ Valid response received");
          handleCommand(data)
          setAiText(data.response)
        } else {
          console.error("❌ Empty response");
          const errorMsg = "I didn't receive a response. Please try again.";
          setAiText(errorMsg)
          speak(errorMsg)
        }
        
        setUserText("")
      } catch (error) {
        console.error("❌ Error in recognition.onresult:", error)
        const errorMsg = "Sorry, I encountered an error. Please try again.";
        setAiText(errorMsg)
        speak(errorMsg)
        setUserText("")
      }
    }

    // Only speak greeting if userData exists
    if (userData && userData.name) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
      greeting.lang = 'hi-IN'
      window.speechSynthesis.speak(greeting)
    }

    return () => {
      isMounted = false
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
    }
  }, [userData]) // Add userData as dependency

  // Add a test button for debugging
  const testConnection = async () => {
    const testCommand = "hello";
    console.log("🧪 Testing with command:", testCommand);
    const data = await getGeminiResponse(testCommand);
    console.log("🧪 Test response:", data);
    if (data && data.response) {
      setAiText(data.response);
      speak(data.response);
    }
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden relative'>

      {/* Background animated particles */}
      <div className="background-animated-particles" aria-hidden="true">
        <span className="particle small" style={{ top: "15%", left: "20%" }} />
        <span className="particle medium" style={{ top: "50%", left: "40%" }} />
        <span className="particle large" style={{ top: "80%", left: "70%" }} />
        <span className="particle small" style={{ top: "30%", left: "75%" }} />
        <span className="particle medium" style={{ top: "65%", left: "15%" }} />
      </div>

      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />

      {/* Mobile menu */}
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />

        <button
          className='min-w-[150px] h-[60px] text-white font-semibold bg-gradient-to-r from-[#1e1b4b] to-[#1e3a8a] rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className='min-w-[150px] h-[60px] text-white font-semibold bg-gradient-to-r from-[#064e3b] to-[#065f46] rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData?.history?.map((his, i) => (
            <div key={i} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          ))}
        </div>
      </div>

      {/* LEFT SIDE BUTTONS */}
      <div className="absolute hidden lg:flex flex-col gap-[20px] top-[20px] left-[20px]">
        <button
          className='min-w-[150px] h-[60px] text-white font-semibold bg-gradient-to-r from-[#1e1b4b] to-[#1e3a8a] rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className='min-w-[150px] h-[60px] text-white font-semibold bg-gradient-to-r from-[#064e3b] to-[#065f46] rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>
      </div>

      {/* Test button for debugging */}
      <button
        className="min-w-[150px] h-[50px] text-white font-semibold bg-blue-600 rounded-full px-5 text-[18px] shadow-xl transition-all duration-300 absolute top-4 right-4"
        onClick={testConnection}
      >
        Test Connection
      </button>

      {/* Main Assistant UI */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img 
          src={currentAssistantImage} 
          alt="AI Assistant" 
          className='h-full w-full object-cover'
          onError={(e) => {
            console.error("Image failed to load, using fallback");
            e.target.src = image1;
          }}
        />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName || "Your Assistant"}</h1>

      {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[200px]' />}

      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText ? userText : aiText ? aiText : "Say something to get started..."}</h1>

      {/* Voice Start/Stop Toggle Button */}
      <button
        className={`min-w-[150px] h-[50px] text-white font-semibold rounded-full px-5 text-[18px] shadow-xl transition-all duration-300 ${
          listening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={toggleListening}
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>

      <ProChatWidget />

      {/* Inline styles for background animation */}
      <style>{`
        @keyframes subtleParticleMove {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) translateX(10px);
            opacity: 0.6;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
        }

        .background-animated-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: subtleParticleMove 6s ease-in-out infinite;
        }

        .particle.small {
          width: 6px;
          height: 6px;
          animation-delay: 0s;
        }

        .particle.medium {
          width: 10px;
          height: 10px;
          animation-delay: 2s;
        }

        .particle.large {
          width: 14px;
          height: 14px;
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Home
