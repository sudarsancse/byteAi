import express from "express";
import { createOrder, verifyPayment } from "../controllers/biling.controllr.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify-payment", verifyPayment);

export default router;
