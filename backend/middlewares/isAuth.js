import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };  // Better than req.userId

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Authentication failed" });
  }
};

export default isAuth;
