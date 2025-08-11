// backend/routes/chat.routes.js
import express from "express";
import { chatWithAI, chatStream } from "../controllers/chat.controller.js";

const router = express.Router();

// normal endpoint (existing)
router.post("/chat", chatWithAI);

// streaming endpoint used by the pro frontend
router.post("/chat/stream", chatStream);

export default router;
