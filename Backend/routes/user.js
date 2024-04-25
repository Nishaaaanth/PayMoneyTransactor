import express from "express";
import { siginSchema, signupSchema, updateSchema } from "../types.js";
import { User, Account } from "../database.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();
router.post("/signin", async (req, res) => {
    const { success } = siginSchema.safeParse(req.body);

    if (!success) res.sendStatus(411).json({ msg: "Invalid username or password" });

    const user = User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({ token: token });
        return;
    }

    res.sendStatus(411).json({ msg: "Error while logging in" });
});

router.post("/signup", async (req, res) => {
    const body = req.body;

    const parsedBody = signupSchema.safeParse(body);
    if (!parsedBody.success) res.sendStatus(403).json({ msg: "Invalid Inputs" });

    const existingUser = await User.findOne({
        username: body.username
    });

    if (existingUser) res.json({ msg: "User already exists" });

    const user = await User.create({
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName
    });

    const userId = user._id;

    await Account.create({
        userId,
        balance: 10000
    });

    const token = jwt.sign({ userId }, JWT_SECRET);

    res.json({
        msg: "User was created Successfully",
        token: token
    });
});

router.put('/', authMiddleware, async (req, res) => {
    const body = req.body;

    const parsedBody = updateSchema.safeParse(body);
    if (!parsedBody.success) res.status(403).json({ msg: "Error while updating information" });

    await User.updateOne({
        _id: req.userId
    }, body);

    res.json({ msg: "Updated Successfully" });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || '';

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },
        {
            lastName: {
                "$regex": filter
            }
        }]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

router.use((err, req, res, next) => {
    res.sendStatus(403).json({ msg: "Error" });
    next();
})

export default router;
