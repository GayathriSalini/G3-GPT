import User from "../models/User.js";
import createSecretToken from "../utils/SceretToken.js";
import bcrypt from "bcrypt";

export const Signup = async (req, res, next) => {
    try {
        const { email, password, username, createdAt } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists", success: false });
        }
        const user = await User.create({ email, password, username, createdAt });
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res
            .status(201)
            .json({ message: "user signed up successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error", success: false })
    }
};

export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ message: "All details are required", success: false })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "User does not exist", success: false })
        }
        const auth = await bcrypt.compare(password, user.password);
        if (!auth) {
            return res.json({ message: "Invalid password or email", success: false })
        }
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.status(200).json({ message: "User logged in successfully", success: true })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error", success: false })
    }
}

export default Login;