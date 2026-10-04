import redis from "../../shared/redis/redis.js";
const protect = async (req, res, next) => {
  try {
    const sessionID = req.cookies?.session;

    if (!sessionID) {
      return res.status(400).json({ message: "Unauthorized !" });
    }

    const session = await redis.get(`session-${sessionID}`);
    if (!session) {
      return res.status(400).json({ message: "Session expired" });
    }

    req.user = JSON.parse(session);
    next();
  } catch (error) {
    return res.status(500).json({ message: `Authorization error ${error}` });
  }
};

export default protect;
