import { RequestHandler, Router } from "express";
import { CreateEvent, GetEvent, GetEvents, UpdateEvent } from "../controllers/event";

const eventRouter = Router();

eventRouter.post("/", CreateEvent as RequestHandler);
eventRouter.get("/", GetEvents as RequestHandler);
eventRouter.get("/:eventId", GetEvent as RequestHandler);
eventRouter.put("/:eventId", UpdateEvent as RequestHandler);

export default eventRouter;
