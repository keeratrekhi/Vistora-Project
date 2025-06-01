import { RequestHandler, Router } from "express";
import { GetPortfolio, CreatePortfolio } from "../controllers/portfolio";

const router = Router();

router.post("/",CreatePortfolio as RequestHandler);
router.get("/:userId", GetPortfolio as RequestHandler);

export default router;