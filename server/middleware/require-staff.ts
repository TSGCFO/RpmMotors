import type { Request, Response, NextFunction } from "express";

export interface StaffSessionUser {
  id: number;
  username: string;
  role: string;
}

declare module "express-session" {
  interface SessionData {
    user?: StaffSessionUser;
  }
}

export interface StaffAuthRequest extends Request {
  staff?: { id: number; username: string; role: string };
}

/**
 * Validates the requester is an authenticated staff member by reading
 * the server-side session populated by /api/auth/login. The session cookie
 * is signed by express-session, so the identity cannot be spoofed by
 * setting a header or sessionStorage value on the client.
 */
export function requireStaff(
  req: StaffAuthRequest,
  res: Response,
  next: NextFunction,
) {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const role = (sessionUser.role ?? "").toLowerCase();
  if (role !== "admin" && role !== "employee") {
    return res.status(403).json({ message: "Staff access required" });
  }

  req.staff = { id: sessionUser.id, username: sessionUser.username, role };
  next();
}

export function requireAdmin(
  req: StaffAuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.staff || req.staff.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
