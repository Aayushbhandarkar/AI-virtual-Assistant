import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import userImg from "../assets/user.gif"
import { FaComments } from "react-icons/fa" 
import ProChatWidget from "../components/ProChatWidget";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  // Chat widget states
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")

  // Debug userData
  useEffect(() => {
    console.log("User Data in Home:", userData)
    console.log("Assistant Image:", userData?.assistantImage)
  }, [userData])

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
    // Cancel any ongoing speech
    synth.cancel()
    
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN'
    
    // Get voices and set Hindi voice if available
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi-IN')
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

    utterence.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      isSpeakingRef.current = false
    }

    synth.speak(utterence)
  }

  const handleCommand = (data) => {
    const { type, userInput, response } = data
    speak(response)

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
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser')
      return
    }

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
      
      setAiText("")
      setUserText(transcript)
      recognition.stop()
      isRecognizingRef.current = false
      setListening(false)
      
      try {
        const data = await getGeminiResponse(transcript)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      } catch (error) {
        console.error("Error getting Gemini response:", error)
        setAiText("Sorry, I encountered an error. Please try again.")
      }
    }

    // Welcome greeting
    if (userData?.name) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
      greeting.lang = 'hi-IN'
      
      // Wait for voices to be loaded
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        window.speechSynthesis.speak(greeting)
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          window.speechSynthesis.speak(greeting)
        })
      }
    }

    return () => {
      isMounted = false
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
      synth.cancel() // Cancel any ongoing speech
    }
  }, [userData?.name]) // Added dependency

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

      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] z-20 cursor-pointer' onClick={() => setHam(true)} />

      {/* Mobile menu */}
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start z-30 ${ham ? "translate-x-0" : "translate-x-full"} transition-transform duration-300`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={() => setHam(false)} />

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

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col'>
          {userData?.history?.length > 0 ? (
            userData.history.map((his, i) => (
              <div key={i} className='text-gray-200 text-[18px] w-full py-2 border-b border-gray-600 truncate'>
                {his}
              </div>
            ))
          ) : (
            <div className='text-gray-400 text-[16px]'>No history yet</div>
          )}
        </div>
      </div>

      {/* LEFT SIDE BUTTONS */}
      <div className="absolute hidden lg:flex flex-col gap-[20px] top-[20px] left-[20px] z-10">
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

      {/* Main Assistant UI */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-white/20 z-10'>
        {userData?.assistantImage ? (
          <img 
            src={userData.assistantImage} 
            alt={`Assistant ${userData?.assistantName}`} 
            className='h-full w-full object-cover'
            onError={(e) => {
              console.error("Failed to load assistant image")
              e.target.style.display = 'none'
              // You can set a fallback image here if needed
            }}
          />
        ) : (
          <div className="text-white text-center p-4">
            <div className="text-lg mb-2">No Assistant Image</div>
            <div className="text-sm opacity-75">Customize your assistant to set an image</div>
          </div>
        )}
      </div>

      <h1 className='text-white text-[18px] font-semibold z-10'>
        I'm {userData?.assistantName || "Your Assistant"}
      </h1>

      {/* Status Images */}
      <div className="z-10">
        {!aiText && <img src={userImg} alt="User speaking" className='w-[200px]' />}
        {aiText && <img src={aiImg} alt="AI responding" className='w-[200px]' />}
      </div>

      {/* Text Display */}
      <h1 className='text-white text-[18px] font-semibold text-wrap text-center max-w-[80%] z-10 min-h-[60px] flex items-center justify-center'>
        {userText ? `You: ${userText}` : aiText ? `Assistant: ${aiText}` : "Speak or type your command..."}
      </h1>

      {/* Voice Start/Stop Toggle Button */}
      <button
        className={`min-w-[150px] h-[50px] text-white font-semibold rounded-full px-5 text-[18px] shadow-xl transition-all duration-300 z-10 ${
          listening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={toggleListening}
      >
        {listening ? '🛑 Stop Listening' : '🎤 Start Listening'}
      </button>

      {/* Chat Widget */}
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
