import React, { useContext, useEffect, useRef, useState } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";
import { userDataContext } from "../context/UserContext";


export default function ProChatWidget() {
  const { serverUrl, userData } = useContext(userDataContext || {});
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("pro_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn("Failed to load chat history:", err);
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingCancel, setStreamingCancel] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("pro_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.warn("Couldn't save chat history:", e);
    }

    const t = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 200;
      }
    }, 50);

    return () => clearTimeout(t);
  }, [messages, open]);

  useEffect(() => {
    return () => {
      if (streamingCancel) {
        try { streamingCancel(); } catch {}
      }
    };
  }, [streamingCancel]);

  const appendMessage = (msg) => setMessages((m) => [...m, msg]);

  const sendStream = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { id: Date.now() + "_u", role: "user", text, time: new Date().toISOString() };
    appendMessage(userMsg);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    setStreamingCancel(() => () => controller.abort());

    try {
      const res = await fetch(`${serverUrl || ""}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          assistantName: userData?.assistantName || "Assistant",
          userName: userData?.name || "User",
        }),
        signal: controller.signal,
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "Server error");
        appendMessage({ id: Date.now() + "_b_err", role: "bot", text: `Error: ${txt}`, time: new Date().toISOString() });
        setLoading(false);
        setStreamingCancel(null);
        return;
      }

      const botId = Date.now() + "_b";
      appendMessage({ id: botId, role: "bot", text: "", time: new Date().toISOString() });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aggregated = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          aggregated += chunk;
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: aggregated } : m)));
        }
      }

      setLoading(false);
      setStreamingCancel(null);

      try {
        const cleaned = aggregated.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed.response === "string") {
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: parsed.response } : m)));
        }
      } catch (e) {
        // keep aggregated text as is
      }
    } catch (err) {
      if (err.name === "AbortError") {
        appendMessage({ id: Date.now() + "_b_cancel", role: "bot", text: "[Cancelled]", time: new Date().toISOString() });
      } else {
        console.error("stream error:", err);
        appendMessage({ id: Date.now() + "_b_err2", role: "bot", text: "Network error.", time: new Date().toISOString() });
      }
      setLoading(false);
      setStreamingCancel(null);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault?.();
    if (loading && streamingCancel) {
      streamingCancel();
      return;
    }
    if (!input.trim()) return;
    sendStream(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    try { localStorage.removeItem("pro_chat_history"); } catch {}
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          title="Open AI chat"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl transform hover:scale-110 bg-gradient-to-br from-indigo-700 via-purple-800 to-pink-700 text-white transition-transform duration-300"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          <FaComments size={20} />
        </button>
      </div>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-xl shadow-2xl border border-gray-700 transform transition-all duration-300 ease-in-out
          ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with AI assistant"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white rounded-t-xl select-none">
          <div className="font-semibold text-lg tracking-wide">AI Assistant</div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearHistory}
              title="Clear chat history"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close chat"
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="h-64 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-900"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 italic select-none">
              Hi — ask me anything.
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex my-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap
                  ${m.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md"
                    : "bg-gray-700 text-gray-200 rounded-bl-none shadow-inner"}
                `}
              >
                <div>{m.text}</div>
                <div className="text-xs mt-1 opacity-60 text-right select-none">
                  {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start my-2">
              <div className="bg-gray-700 px-4 py-2 rounded-2xl inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce inline-block" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce inline-block delay-75" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce inline-block delay-150" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-3 p-3 border-t border-gray-700 bg-gradient-to-t from-gray-900 to-gray-800 rounded-b-xl">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none px-4 py-2 rounded-xl border border-gray-600 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors duration-300"
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={!input.trim() && !loading}
            className={`flex items-center justify-center w-12 h-12 rounded-xl
              text-white transition-colors duration-300
              ${loading ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}
            `}
            aria-label={loading ? "Stop streaming" : "Send message"}
          >
            {loading ? "Stop" : <FaPaperPlane size={18} />}
          </button>
        </form>
      </div>
    </>
  );
}
