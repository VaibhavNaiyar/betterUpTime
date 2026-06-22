import express, { Router } from "express";
import { prismaClient } from "@repo/store/client";
import { authMiddleware } from "../../middleware/auth";

const router: Router = express.Router();

// POST /api/v1/website - create a website to monitor
router.post("/", authMiddleware, async (req, res) => {
    if (!req.body.url) {
        res.status(411).json({ message: "URL is required" });
        return;
    }

    const website = await prismaClient.website.create({
        data: {
            url: req.body.url,
            timeAdded: new Date(),
            user_id: req.userId!,
        },
    });

    res.json({ id: website.id });
});

// GET /api/v1/website/status/:websiteId - get status of a website
router.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const website = await prismaClient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: req.params.websiteId,
        },
    });

    if (!website) {
        res.status(409).json({ message: "Website not found" });
        return;
    }

    res.json({
        url: website.url,
        id: website.id,
        user_id: website.user_id,
    });
});

export default router;
