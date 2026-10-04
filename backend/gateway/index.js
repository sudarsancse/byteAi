import "./env.js";
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controllers.js";
import { proxyWithHeader } from "./utils/proxyWithHeaders.js";
import morgan from "morgan";

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

// ! Morgan setup
app.use(morgan("dev"));

// * Auth SERVICE Server
app.use("/api/auth", proxy(process.env.AUTH_SERVICE));

// * Chat SERVICE Server
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));

// * Agent SERVICE Server
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE));

// * BILING SERVICE Server
app.use("/api/biling", protect, proxyWithHeader(process.env.BILING_SERVICE));

app.get("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.json({ message: "Hello from gateway" });
});

app.listen(PORT, () => {
  console.log(`Gateway started at port: ${PORT}`);
});
