import express, { Router } from "express";
import { prismaClient } from "@repo/store/client";

const router: Router = express.Router();

// GET /api/v1/website - get all websites
router.get("/", async (_req, res) => {
  const websites = await prismaClient.website.findMany();
  res.json(websites);
});

// POST /api/v1/website - add a website to monitor
router.post("/", async (req, res) => {
  const { url } = req.body;

  const website = await prismaClient.website.create({
    data: {
      url,
      timeAdded: new Date(),
    },
  });

  res.json(website);
});

// DELETE /api/v1/website/:id - remove a website
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await prismaClient.website.delete({
    where: { id },
  });

  res.json({ message: "Website removed" });
});

export default router;
