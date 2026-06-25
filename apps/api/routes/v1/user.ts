import express, { Router } from "express";
import { prismaClient } from "@repo/store/client";
import { AuthInput } from "../../types";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

// POST /api/v1/user/signup
router.post("/signup", async (req, res) => {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({ message: "Invalid input" });
        return;
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                username: data.data.username,
                password: data.data.password,
            },
        });
        res.json({ id: user.id });
    } catch (e) {
        res.status(403).json({ message: "User already exists" });
    }
});

// POST /api/v1/user/signin
router.post("/signin", async (req, res) => {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { username: data.data.username },
    });

    if (!user || user.password !== data.data.password) {
        res.status(403).json({ message: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!);
    res.json({ token });
});

export default router;
