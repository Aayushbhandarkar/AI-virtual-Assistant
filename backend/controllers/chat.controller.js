// backend/controllers/chat.controller.js
import geminiResponse from "../gemini.js";

/**
 * Non-streaming simple endpoint (keeps backwards compatibility)
 * POST /api/chat
 * body: { message, assistantName?, userName? }
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, assistantName = "Assistant", userName = "Creator" } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const raw = await geminiResponse(message, assistantName, userName);
    // If gemini returns ```json...``` or code block, you may parse later in controller route
    return res.json({ reply: raw });
  } catch (err) {
    console.error("chatWithAI error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * Streaming endpoint:
 * POST /api/chat/stream
 * body: { message, assistantName?, userName? }
 *
 * This calls your geminiResponse, then streams its reply in small chunks
 * so the frontend can render progressive typing.
 */
export const chatStream = async (req, res) => {
  try {
    const { message, assistantName = "Assistant", userName = "Creator" } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Call existing gemini.js (unchanged)
    const raw = await geminiResponse(message, assistantName, userName);
    // raw is a full string (maybe JSON wrapped or plain). We'll stream it.

    // Setup SSE-like streaming headers (we'll use plain text stream)
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no"); // for nginx buffering disable
    // Keep connection open while streaming chunks
    res.flushHeaders && res.flushHeaders();

    // If you want to stream parsed JSON.response only, you could attempt to parse here.
    // But to stay safe (and keep voice assistant unchanged), stream raw string.
    // We'll split into reasonably sized chunks:
    const chunkSize = 40; // tweak if you want faster/slower chunking
    let idx = 0;
    while (idx < raw.length) {
      const part = raw.slice(idx, idx + chunkSize);
      res.write(part);
      idx += chunkSize;
      // small delay so frontend shows typing
      // NOTE: use small await to avoid blocking event loop too long
      await new Promise((r) => setTimeout(r, 40)); // 40ms between chunks
    }
    // finish
    res.end();
  } catch (err) {
    console.error("chatStream error:", err);
    // send a fallback error message
    try {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write("Error: Failed to get response.");
      res.end();
    } catch (e) {}
  }
};
