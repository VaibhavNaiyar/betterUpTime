import express, { Router } from "express";
import { prismaClient } from "@repo/store/client";

const router: Router = express.Router();

// GET /api/v1/user - get all users
router.get("/", async (_req, res) => {
  const users = await prismaClient.user.findMany();
  res.json(users);
});

export default router;
