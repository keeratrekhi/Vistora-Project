import { RequestHandler, Router } from "express";
import {  GetPublicEvent } from "../controllers/event";
import { downloadMultipleFilesHandler, downloadSingleFileHandler, getBulkDownloadUrlsHandler, getCoverController, GetMedia } from "../controllers/backblaze";

const publicRouter = Router();


publicRouter.get("/public/:eventId", GetPublicEvent as RequestHandler);
publicRouter.get("/:eventId", GetMedia as RequestHandler);
publicRouter.get("/eventscover/:eventId", getCoverController as RequestHandler);
publicRouter.get('/download/:eventId/:fileName', downloadSingleFileHandler as RequestHandler);
publicRouter.post('/download-multiple-zip/:eventId', downloadMultipleFilesHandler as RequestHandler);
publicRouter.post('/download-multiple-urls/:eventId', getBulkDownloadUrlsHandler as RequestHandler);


export default publicRouter;
