import { Router } from "express";
import { Testing } from "../controllers/test";


const router=Router();

router.get("/test-db",Testing);

export default router;