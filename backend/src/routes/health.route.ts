import { RequestHandler, Router } from "express";
import { HealthCheck } from "../controllers/health";


const router = Router();

router.get('/',HealthCheck as RequestHandler);

export default router;