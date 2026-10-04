import "./env.js";
import express from "express";
import dns from "node:dns/promises";

import connectDB from "./config/db.js";
import router from "./routes/biling.routes.js";

// 🔥 Force Cloudflare DNS (fix for MongoDB SRV errors on Windows)
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const PORT = process.env.PORT || 8004;

const app = express();
app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "Hello from biling server " });
});

app.listen(PORT, () => {
  console.log(`Bilig server started at port : ${PORT}`);
  //*MONGODB Connection function
  connectDB();
});
