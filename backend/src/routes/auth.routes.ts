import { RequestHandler, Router } from "express";
import { Login, signout, Signup } from "../controllers/auth";

const router = Router();

router.post("/signup",Signup as RequestHandler);
router.post("/login",Login as RequestHandler);
router.post("/signout",signout as RequestHandler);

export default router;
