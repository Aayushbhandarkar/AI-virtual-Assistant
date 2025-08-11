import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import userImg from "../assets/user.gif"
import { FaComments } from "react-icons/fa" // Chat icon
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
        startRecognition()
      }, 800)
    }

    synth.cancel()
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
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognitionRef.current = recognition

    let isMounted = true

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start()
          console.log("Recognition requested to start")
        } catch (e) {
          if (e.name !== "InvalidStateError") console.error(e)
        }
      }
    }, 1000)

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (isMounted && !isSpeakingRef.current) {
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
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
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
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false
        setListening(false)
        const data = await getGeminiResponse(transcript)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    }

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
    greeting.lang = 'hi-IN'
    window.speechSynthesis.speak(greeting)

    return () => {
      isMounted = false
      clearTimeout(startTimeout)
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
    }
  }, [])

  // Chat send function
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { text: chatInput, sender: "user" }]
    setChatMessages(newMessages)
    setChatInput("")

    try {
      const res = await fetch(`${serverUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      })
      const data = await res.json()
      setChatMessages([...newMessages, { text: data.reply, sender: "bot" }])
    } catch (err) {
      console.error("Chat error:", err)
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
          {userData.history?.map((his, i) => (
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

      {/* Main Assistant UI */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>

      {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[200px]' />}

      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText ? userText : aiText ? aiText : null}</h1>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-blue-500/80 transition-transform duration-300 ease-in-out"
          onClick={() => setChatOpen(!chatOpen)}
          aria-label="Toggle Chat"
          title="Chat with Assistant"
        >
          <FaComments size={26} />
        </button>
      </div>

      {/* Chat Popup */}
      {chatOpen && (
        <div 
          className="fixed bottom-20 right-5 w-80 bg-white shadow-2xl rounded-lg flex flex-col
            animate-fadeInUp"
          style={{ animationDuration: '0.4s', animationTimingFunction: 'ease-out' }}
          role="dialog"
          aria-modal="true"
          aria-label="Chat with AI assistant"
        >
          <div className="p-3 bg-blue-700 text-white font-semibold rounded-t-lg select-none">AI Chat</div>
          <div className="flex-1 p-3 h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-messageFade`}
                style={{ animationDuration: '0.3s', animationTimingFunction: 'ease-in-out' }}
              >
                <span
                  className={`inline-block px-3 py-2 max-w-[70%] break-words rounded-lg
                    ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"}`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <form
            className="flex p-2 border-t"
            onSubmit={e => { e.preventDefault(); sendChatMessage() }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-r-lg transition-colors duration-300"
              aria-label="Send chat message"
            >
              Send
            </button>
          </form>
        </div>
      )}

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
