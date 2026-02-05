import User from "../models/User.js";
import "dotenv/config";
import jwt from "jsonwebtoken";

export const userVerification = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ status: false });
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false });
        } else {
            const user = await User.findById(data.id);
            if (user) {
                req.userId = user._id; // Attach ID for chat routes

                // If this is a direct call to verify (from frontend Home.jsx)
                if (req.method === "POST" && req.path === "/") {
                    return res.json({ status: true, user: user.username });
                }

                next(); // Continue to next middleware/route handler
            } else {
                return res.json({ status: false });
            }
        }
    });
};
