import { getAuth } from "firebase-admin/auth";
import fireBase from "../Config/fireBase.js";
import UserModel from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

//* Login route
export const login = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = await getAuth(fireBase).verifyIdToken(token);
    let user = await UserModel.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await UserModel.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avater: decoded.picture,
      });
    }

    const sessionId = crypto.randomUUID();

    // ^ redis setup (store session id and cookie)
    await redis.set(
      `user-session-${user?._id}`,
      sessionId,
      "EX",
      7 * 24 * 60 * 60,
    );
    await redis.set(
      `session-${sessionId}`, // * Redis key
      JSON.stringify({
        userID: user._id,
        name: user.name,
        email: user.email,
        avater: user.avater,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
      }),
      "EX",
      7 * 24 * 60 * 60, //? Session Expiry date is (7days)
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `login error : ${error}` });
  }
};

//! LogOut route
export const logOut = async (req, res) => {
  try {
    const sessionID = req.cookies?.session;

    // ! Delete the data from redis (based on session Id)
    await redis.del(`session-${sessionID}`);

    res.clearCookie("session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: " Logout sucessfully" });
  } catch (error) {
    return res.status(500).json({ message: `logout error : ${error}` });
  }
};

export const UpdateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planEXPAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    // REDIS UPDATE

    const sessionId = await redis.get(`user-session-${user?._id}`);

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userID: user._id,
        name: user.name,
        email: user.email,
        avater: user.avater,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpAt: user.planEXPAt,
      }),
      "EX",
      7 * 24 * 60 * 60, //? Session Expiry at (7days)
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Update user payment error : ${error}`,
    });
  }
};

export const dedcutCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10,
    };

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User not found`,
      });
    }

    const requiredCredits = COST[agent] || 1;
    if (user.credits < requiredCredits) {
      return res.status(400).json({
        success: false,
        message: `Not enough credits`,
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    // REDIS UPDATE

    const sessionId = await redis.get(`user-session-${user?._id}`);

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userID: user._id,
        name: user.name,
        email: user.email,
        avater: user.avater,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpAt: user.planEXPAt,
      }),
      "EX",
      7 * 24 * 60 * 60, //? Session Expiry at (7days)
    );
    return res.status(200).json({ success: true, credits: user.credits });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Deduct credits error : ${error}`,
    });
  }
};
