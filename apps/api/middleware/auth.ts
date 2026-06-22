import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) {
        res.status(403).json({ message: "No authorization header" });
        return;
    }
    try {
        const data = jwt.verify(header, process.env.JWT_SECRET!) as jwt.JwtPayload;
        req.userId = data.sub as string;
        next();
    } catch (e) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
}
