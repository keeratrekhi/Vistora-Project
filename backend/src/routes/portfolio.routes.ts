import { RequestHandler, Router } from "express";
import { GetPortfolio, CreatePortfolio, Portfolio, GetPortEvents } from "../controllers/portfolio";
import { getCoverController } from "../controllers/backblaze";

const router = Router();

router.post("/",CreatePortfolio as RequestHandler);
router.get("/:userId", GetPortfolio as RequestHandler);
// router.get("/getport/:name", Portfolio as RequestHandler);
// router.get("/events/:userId",GetPortEvents as RequestHandler);
// router.get("/eventcover/:eventId",getCoverController as RequestHandler);

export default router;