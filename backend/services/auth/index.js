import "./env.js";
import express from "express";
import dns from "node:dns/promises";
import connectDB from "./Config/db.js";
import router from "./routes/auth.route.js";

// 🔥 Force Cloudflare DNS (fix for MongoDB SRV errors on Windows)
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const PORT = process.env.PORT || 8001;

const app = express();
app.use(express.json());

// ! All routers
app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "hello from Auth services v2" });
});

app.listen(PORT, () => {
  console.log(`Auth services started at port: ${PORT}`);

  //*MONGODB Connection function
  connectDB();
});
