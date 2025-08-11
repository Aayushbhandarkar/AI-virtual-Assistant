import axios from "axios";

// Chat history memory (multi-turn conversation ke liye)
let conversationHistory = [];

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    // Store new user query in history
    conversationHistory.push({ role: "user", content: command });

    // Convert history into text for context
    const historyText = conversationHistory
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

    // Prompt with full instructions + history
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<original user input>" {only remove your name from userInput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only wo search wala text jaye,
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. Aur agar koi aisa question puchta hai jiska answer tumhe pata hai usko bhi general category me rakho bas short answer dena.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open Instagram.
- "facebook-open": if user wants to open Facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tumhe kisne banaya.
- Only respond with the JSON object, nothing else.

Conversation so far:
${historyText}

Now your new userInput: ${command}
`;

    const result = await axios.post(apiUrl, {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });

    const botReply = result.data.candidates[0]?.content?.parts[0]?.text || "";

    // Save assistant reply to history
    conversationHistory.push({ role: "assistant", content: botReply });

    return botReply;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Sorry, I had trouble processing that."
    });
  }
};

export default geminiResponse;
