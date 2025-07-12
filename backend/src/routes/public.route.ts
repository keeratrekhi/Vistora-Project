import { RequestHandler, Router } from "express";
import {  GetPublicEvent } from "../controllers/event";
import { downloadMultipleFilesHandler, downloadSingleFileHandler, getBulkDownloadUrlsHandler, getCoverController, GetMedia, getPortfolioCoverController } from "../controllers/backblaze";
import { GetPortEvents, Portfolio } from "../controllers/portfolio";

const publicRouter = Router();


publicRouter.get("/public/:eventId", GetPublicEvent as RequestHandler);
publicRouter.get("/:eventId", GetMedia as RequestHandler);
publicRouter.get("/eventscover/:eventId", getCoverController as RequestHandler);
publicRouter.get('/download/:eventId/:fileName', downloadSingleFileHandler as RequestHandler);
publicRouter.get('/download-multiple-zip/:eventId', downloadMultipleFilesHandler as RequestHandler);
publicRouter.post('/download-multiple-urls/:eventId', getBulkDownloadUrlsHandler as RequestHandler);
publicRouter.get('/public/getport/:name', Portfolio as RequestHandler);
publicRouter.get("/public/events/:userId",GetPortEvents as RequestHandler);
publicRouter.get("/public/porteventcover/:eventId",getCoverController as RequestHandler);
publicRouter.get("/public/portfoliocover/:name", getPortfolioCoverController as RequestHandler);

export default publicRouter;
