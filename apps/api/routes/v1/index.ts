import Router from  "express";

const router = Router();

router.use("/user",usersRouter);
router.use("/website",websiteRouter);


export default router;