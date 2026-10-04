import express from "express";
import {
  dedcutCredits,
  login,
  logOut,
  UpdateUserPayment,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logOut);
router.post("/update-plan", UpdateUserPayment);
router.post("/deduct-credits", dedcutCredits);

export default router;
