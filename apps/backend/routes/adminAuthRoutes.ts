import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const isAuthDisabled = () => {
  if (process.env.ADMIN_AUTH_DISABLED === "true") {
    return true;
  }
  if (process.env.ADMIN_AUTH_DISABLED === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
};

router.post("/login", (req: Request, res: Response) => {
  if (isAuthDisabled()) {
    return res.status(200).json({ token: "dev-admin-bypass-token" });
  }

  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!adminEmail || !adminPassword || !secret) {
    return res.status(500).json({
      message:
        "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JWT_SECRET.",
    });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, secret, {
    expiresIn: "12h",
  });

  return res.status(200).json({ token });
});

export default router;
