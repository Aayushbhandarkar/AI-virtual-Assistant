import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import userImg from "../assets/user.gif"
import { FaComments } from "react-icons/fa" // Chat icon
import ProChatWidget from "../components/ProChatWidget"

// Helper for particle sparkle effect
const createSparkle = (container) => {
  const sparkle = document.createElement('div')
  sparkle.style.position = 'absolute'
  sparkle.style.width = '6px'
  sparkle.style.height = '6px'
  sparkle.style.background = 'white'
  sparkle.style.borderRadius = '50%'
  sparkle.style.pointerEvents = 'none'
  sparkle.style.opacity = '0.8'
  sparkle.style.boxShadow = '0 0 8px 2px #00f6ff'
  sparkle.style.left = `${Math.random() * 100}%`
  sparkle.style.top = `${Math.random() * 100}%`
  sparkle.style.animation = 'sparkleAnim 1s ease-out forwards'
  container.appendChild(sparkle)
  setTimeout(() => container.removeChild(sparkle), 1000)
}

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

  // For mood emoji & loading
  const [assistantMood, setAssistantMood] = useState('neutral') // neutral, happy, thinking, listening
  const [loadingResponse, setLoadingResponse] = useState(false)

  // Night mode toggle
  const [darkMode, setDarkMode] = useState(true)

  // Particle container ref
  const particleRef = useRef(null)

  // Chat widget states
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")

  // History fade-in state
  const [historyVisible, setHistoryVisible] = useState(false)

  // Smooth scroll helper on logout
  const handleLogOut = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?")
    if (!confirmed) return

    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(async () => {
      try {
        await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
        setUserData(null)
        navigate("/signin")
      } catch (error) {
        setUserData(null)
        console.log(error)
      }
    }, 500) // delay logout for scroll to complete
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start()
        setAssistantMood('listening')
        sparkleEffect()
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
    setAssistantMood('happy')
    utterence.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      setAssistantMood('neutral')
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
          setAssistantMood('listening')
          sparkleEffect()
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
      setAssistantMood('neutral')
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              setAssistantMood('listening')
              sparkleEffect()
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
      setAssistantMood('neutral')
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              setAssistantMood('listening')
              sparkleEffect()
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
        setAssistantMood('thinking')
        setLoadingResponse(true)
        const data = await getGeminiResponse(transcript)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
        setAssistantMood('happy')
        setLoadingResponse(false)
      }
    }

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
    greeting.lang = 'hi-IN'
    window.speechSynthesis.speak(greeting)

    // Show history fade in after mount
    setTimeout(() => setHistoryVisible(true), 800)

    return () => {
      isMounted = false
      clearTimeout(startTimeout)
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
      setAssistantMood('neutral')
    }
  }, [])

  // Particle sparkle effect on chat toggle or voice start
  const sparkleEffect = () => {
    if (!particleRef.current) return
    for (let i = 0; i < 7; i++) {
      setTimeout(() => createSparkle(particleRef.current), i * 120)
    }
  }

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
    <>
      <style>{`
        /* Background gradient animation */
        @keyframes bgGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Sparkle animation */
        @keyframes sparkleAnim {
          0% {opacity: 1; transform: scale(1);}
          100% {opacity: 0; transform: scale(2);}
        }
        /* Fade-in for history items */
        .history-fadein > div {
          opacity: 0;
          transform: translateY(15px);
          animation: fadeInUp 0.5s forwards;
        }
        .history-fadein > div:nth-child(1) { animation-delay: 0.1s; }
        .history-fadein > div:nth-child(2) { animation-delay: 0.2s; }
        .history-fadein > div:nth-child(3) { animation-delay: 0.3s; }
        .history-fadein > div:nth-child(4) { animation-delay: 0.4s; }
        .history-fadein > div:nth-child(5) { animation-delay: 0.5s; }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Message fade */
        @keyframes messageFade {
          0% {opacity: 0; transform: translateY(20px);}
          100% {opacity: 1; transform: translateY(0);}
        }
        /* Neon glow on assistant image */
        .assistant-glow {
          filter: drop-shadow(0 0 6px #00f6ff);
          transition: filter 0.3s ease;
        }
        .assistant-glow.happy {
          filter: drop-shadow(0 0 12px #00ffff);
        }
        /* Voice visualizer bars */
        .voice-bars {
          display: flex;
          gap: 3px;
          margin-top: 6px;
          justify-content: center;
        }
        .voice-bar {
          width: 4px;
          height: 10px;
          background: #00ffff;
          border-radius: 2px;
          animation: barAnim 1.2s infinite ease-in-out;
        }
        .voice-bar:nth-child(1) { animation-delay: 0s; }
        .voice-bar:nth-child(2) { animation-delay: 0.2s; }
        .voice-bar:nth-child(3) { animation-delay: 0.4s; }
        @keyframes barAnim {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }
        /* Thinking dots animation */
        .thinking-dots {
          display: inline-flex;
          gap: 4px;
        }
        .thinking-dots span {
          width: 6px;
          height: 6px;
          background: #00ffff;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .thinking-dots span:nth-child(1) { animation-delay: 0s; }
        .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        /* Mood emoji styling */
        .mood-emoji {
          font-size: 24px;
          margin-top: 6px;
          user-select: none;
          animation: moodPulse 2s ease-in-out infinite;
        }
        @keyframes moodPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        /* Night mode toggle */
        .night-toggle {
          position: fixed;
          top: 20px;
          right: 70px;
          background: rgba(0,0,0,0.5);
          color: #0ff;
          border: 2px solid #0ff;
          padding: 6px 10px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease;
          z-index: 60;
        }
        .night-toggle:hover {
          background: #0ff;
          color: #000;
        }
        /* Particle container */
        .particle-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
          z-index: 0;
        }
        /* Popup chat reminder */
        .popup-chat-reminder {
          position: fixed;
          bottom: 80px;
          right: 20px;
          padding: 12px 20px;
          background-color: #2563eb;
          color: white;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.5);
          cursor: pointer;
          user-select: none;
          animation: fadeInOut 5s ease-in-out infinite;
          z-index: 60;
        }
        @keyframes fadeInOut {
          0%, 100% {opacity: 0;}
          20%, 80% {opacity: 1;}
        }
      `}</style>

      <div
        className={`w-full h-[100vh] flex justify-center items-center flex-col gap-[15px] overflow-hidden relative
          ${darkMode ? 'bg-gradient-to-t from-[black] to-[#02023d]' : 'bg-gradient-to-t from-gray-200 to-gray-100'}`}
        style={{
          backgroundSize: '200% 200%',
          animation: 'bgGradient 15s ease infinite',
          color: darkMode ? '#0ff' : '#333'
        }}
      >

        {/* Particle sparkle container */}
        <div ref={particleRef} className="particle-container" />

        {/* Night mode toggle */}
        <button
          className="night-toggle"
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle dark/light mode"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <CgMenuRight className={`lg:hidden absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer text-${darkMode ? 'cyan-400' : 'blue-700'}`} onClick={() => setHam(true)} />

        {/* Mobile menu */}
        <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start
          ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
          <RxCross1 className={`absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer text-${darkMode ? 'cyan-400' : 'blue-700'}`} onClick={() => setHam(false)} />

          <button
            className='min-w-[150px] h-[60px] font-semibold rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
            style={{ background: darkMode ? 'linear-gradient(90deg, #1e1b4b, #1e3a8a)' : 'linear-gradient(90deg, #dbeafe, #bfdbfe)', color: darkMode ? 'white' : '#1e40af' }}
            onClick={handleLogOut}
          >
            Log Out
          </button>
          <button
            className='min-w-[150px] h-[60px] font-semibold rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
            style={{ background: darkMode ? 'linear-gradient(90deg, #064e3b, #065f46)' : 'linear-gradient(90deg, #a7f3d0, #6ee7b7)', color: darkMode ? 'white' : '#065f46' }}
            onClick={() => navigate("/customize")}
          >
            Customize your Assistant
          </button>

          <div className={`w-full h-[2px] ${darkMode ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
          <h1 className={`font-semibold text-[19px] ${darkMode ? 'text-white' : 'text-gray-700'}`}>History</h1>

          <div className={`w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate history-fadein`} style={{ color: darkMode ? '#ccc' : '#444' }}>
            {historyVisible && userData.history?.map((his, i) => (
              <div key={i} style={{ animationDelay: `${0.1 * i}s` }}>{his}</div>
            ))}
          </div>
        </div>

        {/* LEFT SIDE BUTTONS */}
        <div className="absolute hidden lg:flex flex-col gap-[20px] top-[20px] left-[20px]">
          <button
            className='min-w-[150px] h-[60px] font-semibold rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
            style={{ background: darkMode ? 'linear-gradient(90deg, #1e1b4b, #1e3a8a)' : 'linear-gradient(90deg, #dbeafe, #bfdbfe)', color: darkMode ? 'white' : '#1e40af' }}
            onClick={handleLogOut}
          >
            Log Out
          </button>
          <button
            className='min-w-[150px] h-[60px] font-semibold rounded-full px-5 text-[18px] shadow-xl hover:scale-105 transition-all duration-300'
            style={{ background: darkMode ? 'linear-gradient(90deg, #064e3b, #065f46)' : 'linear-gradient(90deg, #a7f3d0, #6ee7b7)', color: darkMode ? 'white' : '#065f46' }}
            onClick={() => navigate("/customize")}
          >
            Customize your Assistant
          </button>
        </div>

        {/* Main Assistant UI */}
        <div className="relative w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
          <img
            src={userData?.assistantImage}
            alt="assistant"
            className={`h-full object-cover assistant-glow ${assistantMood === 'happy' ? 'happy' : ''}`}
          />
          {/* Voice visualizer bars */}
          {isSpeakingRef.current && (
            <div className="voice-bars absolute bottom-5 left-1/2 transform -translate-x-1/2">
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
            </div>
          )}
        </div>

        {/* Assistant name + mood emoji */}
        <div className="flex flex-col items-center">
          <h1 className={`text-[18px] font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>I'm {userData?.assistantName}</h1>
          <div
            className="mood-emoji"
            aria-label="Assistant mood"
            title="Assistant mood"
          >
            {assistantMood === 'happy' && "😊"}
            {assistantMood === 'neutral' && "😐"}
            {assistantMood === 'thinking' && "🤔"}
            {assistantMood === 'listening' && "👂"}
          </div>
        </div>

        {/* AI/user image and text */}
        {!aiText && <img src={userImg} alt="User" className='w-[200px]' />}
        {loadingResponse && (
          <div className="thinking-dots" aria-live="polite" aria-label="Assistant is thinking">
            <span></span><span></span><span></span>
          </div>
        )}
        {aiText && !loadingResponse && <img src={aiImg} alt="AI" className='w-[200px]' />}

        {/* Display user or AI text */}
        <h1 className={`text-[18px] font-semibold text-center max-w-[280px] px-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {userText ? userText : aiText ? aiText : null}
        </h1>

        {/* Pop up chat reminder */}
        {!chatOpen && (
          <div
            className={`popup-chat-reminder`}
            onClick={() => setChatOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Open chat"
          >
            You can also chat!
          </div>
        )}

        {/* Floating Chat Icon */}
        <div className="fixed bottom-5 right-5 z-50" ref={particleRef}>
          <button
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-blue-500/80 transition-transform duration-300 ease-in-out"
            onClick={() => {
              sparkleEffect()
              setChatOpen(!chatOpen)
            }}
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
      </div>
    </>
  )
}

export default Home
