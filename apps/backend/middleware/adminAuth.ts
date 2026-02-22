import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  email: string;
  role: string;
}

const isAuthDisabled = () => {
  if (process.env.ADMIN_AUTH_DISABLED === "true") {
    return true;
  }
  if (process.env.ADMIN_AUTH_DISABLED === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
};

const getSecret = () => process.env.ADMIN_JWT_SECRET;

const getTokenFromHeader = (authorization?: string) => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isAuthDisabled()) {
    return next();
  }

  const secret = getSecret();
  if (!secret) {
    return res
      .status(500)
      .json({ message: "ADMIN_JWT_SECRET is not configured" });
  }

  const token = getTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Missing admin token" });
  }

  try {
    const payload = jwt.verify(token, secret) as AdminTokenPayload;
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid admin token" });
  }
};
