import express from "express";
import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
} from "../controllers/userController.js"; // ✅ correct filename if it's "userController.js"
import isAuth from "../middleware/isAuth.js"; // ✅ folder should be singular: "middleware"
import upload from "../middleware/multer.js"; // ✅ same here

const router = express.Router();

// ✅ Get current user info
router.get("/current-user", isAuth, getCurrentUser);

// ✅ Update assistant (name + image/file)
router.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);

// ✅ Ask to assistant
router.post("/ask", isAuth, askToAssistant);

export default router;
