import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Configs & Utils
dotenv.config();
import connectDb from "./config/db.js";

// Routers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();
const port = process.env.PORT || 5000;

// 🔐 CORS Configuration
app.use(
  cors({
    origin: "https://ai-virtual-assitant-frontend-a3ar.onrender.com",
    credentials: true,
  })
);

// 🧠 Middleware
app.use(express.json());
app.use(cookieParser());

// 🛣️ API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// 🚀 Start Server
app.listen(port, async () => {
  await connectDb();
  console.log(`✅ Server started on http://localhost:${port}`);
});
