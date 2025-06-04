import { RequestHandler, Router } from "express";
import { GetPortfolio, CreatePortfolio, Portfolio } from "../controllers/portfolio";

const router = Router();

router.post("/",CreatePortfolio as RequestHandler);
router.get("/:userId", GetPortfolio as RequestHandler);
router.get("/getport/:name", Portfolio as RequestHandler);

export default router;