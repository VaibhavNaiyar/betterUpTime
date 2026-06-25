import express, { Router } from "express";
import { prismaClient } from "@repo/store/client";
import { authMiddleware } from "../../middleware/auth";

const router: Router = express.Router();

// POST /api/v1/website — add a website to monitor
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

// GET /api/v1/website/all — list all websites for the logged-in user with latest ticks
router.get("/all", authMiddleware, async (req, res) => {
    const websites = await prismaClient.website.findMany({
        where: { user_id: req.userId! },
        include: {
            ticks: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    res.json({ websites });
});

// GET /api/v1/website/status/:websiteId — get a single website with tick history
router.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const website = await prismaClient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: req.params.websiteId,
        },
        include: {
            ticks: {
                orderBy: { createdAt: "desc" },
                take: 50,
            },
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
        ticks: website.ticks,
    });
});

// DELETE /api/v1/website/:id — remove a website
router.delete("/:id", authMiddleware, async (req, res) => {
    const website = await prismaClient.website.findFirst({
        where: { id: req.params.id, user_id: req.userId! },
    });

    if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
    }

    await prismaClient.websiteTick.deleteMany({
        where: { website_id: req.params.id },
    });

    await prismaClient.website.delete({ where: { id: req.params.id } });

    res.json({ message: "Website deleted" });
});

export default router;
