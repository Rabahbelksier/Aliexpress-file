import { Router, type IRouter } from "express";
import healthRouter from "./health";
import devicesRouter from "./devices";
import relayRouter from "./relay";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devicesRouter);
router.use(relayRouter);

export default router;
