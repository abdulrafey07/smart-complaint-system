import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;
    error.code = "AUTH_TOKEN_REQUIRED";
    throw error;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      const error = new Error("User is not authorized");
      error.statusCode = 401;
      error.code = "AUTH_USER_UNAUTHORIZED";
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    error.statusCode = 401;
    error.message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid authentication token";
    throw error;
  }
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    error.code = "AUTH_REQUIRED";
    return next(error);
  }

  if (!roles.includes(req.user.role)) {
    const error = new Error("You do not have permission to perform this action");
    error.statusCode = 403;
    error.code = "AUTH_FORBIDDEN";
    return next(error);
  }
  return next();
};
