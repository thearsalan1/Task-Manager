import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  try {
    const PayLoad = verifyToken(token);
    req.user = { id: PayLoad.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};