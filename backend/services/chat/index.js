import "./env.js";
import express from "express";
import mongoose from "mongoose";
import dns from "node:dns/promises";
import connectDB from "./config/chat.db.js";
import router from "./routes/chat.routes.js";
// 🔥 Force Cloudflare DNS (fix for MongoDB SRV errors on Windows)
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const PORT = process.env.PORT || 8002;
const app = express();
app.use(express.json());

//* Messages route
app.use("/", router);

app.use("/", (req, res) => {
  res.status(200).json({ message: "hii from chat server " });
});

app.listen(PORT, () => {
  console.log(`Chat service started at port: ${PORT}`);
  connectDB();
});
