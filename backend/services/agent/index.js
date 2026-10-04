import "./env.js";
import express from "express";
import mongoose from "mongoose";
import dns from "node:dns/promises";
import connectDB from "./Config/db.js";
import router from "./routes/agent.routes.js";

// 🔥 Force Cloudflare DNS (fix for MongoDB SRV errors on Windows)
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const PORT = process.env.PORT || 8003;

const app = express();
app.use(express.json());

//* Agent routers
app.use("/", router);

app.use((err, req, res, next) => {
  console.log(err);

  if (err.status) {
    return res.status(err.status).json(err.data);
  }

  return res.status(500).json({ message: `Agent error ${err}` });
});

// app.use("/", (req, res) => {
//   res.json("Hii from server agent");
// });

app.listen(PORT, () => {
  console.log(`Agent services started at port: ${PORT}`);
  // connectDB();
});
