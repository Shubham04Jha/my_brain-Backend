import { Router } from "express";
import contentRouter from "./contentRouter.ts";
import userRouter from "./userRouter.ts";

const router = Router();

router.use('/api/v1/user',userRouter);
router.use('/api/v1/content',contentRouter);

export default router;