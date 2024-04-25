import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !(authHeader.startsWith("Bearer"))) res.status(403).json({msg: "Invalid Auth"});

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "you are not authorized to do this" });
    }
}
