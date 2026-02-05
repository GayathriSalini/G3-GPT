import express from "express";
import { Signup, Login } from "../middleware/authcon.js";
import { userVerification } from "../middleware/authmiddle.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);


router.get("/signup", (req, res) => {
    res.send("Auth signup route is working!");
});

router.get("/login", (req, res) => {
    res.send("Auth login route is working!")
})

router.post("/", userVerification)


export default router;
