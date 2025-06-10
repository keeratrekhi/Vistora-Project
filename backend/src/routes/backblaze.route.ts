import express, { RequestHandler } from "express";
import UploadHandler, { bulkDeleteFiles,  deleteCoverController, deleteEvent, deleteFile, deletePortfolioCoverController, downloadMultipleFilesHandler, downloadSingleFileHandler, getBulkDownloadUrlsHandler, getCoverController, GetMedia, getPortfolioCoverController, uploadCoverController, uploadPortfolioCoverController} from "../controllers/backblaze";


const router = express.Router();

router.post("/upload", UploadHandler as RequestHandler);
// router.get("/events/:eventId", GetMedia as RequestHandler); this route is now public

//Cover image routes

router.post("/uploadcover/:eventId", uploadCoverController as RequestHandler);
// router.get("/eventscover/:eventId", getCoverController as RequestHandler); this route is now public
router.delete("/mediacover/:eventId/:fileName", deleteCoverController as RequestHandler);


//Portfolio routes

router.post("/uploadportfoliocover/:name", uploadPortfolioCoverController as RequestHandler);
router.get("/portfoliocover/:name", getPortfolioCoverController as RequestHandler);
router.delete("/portfoliocover/:name/:fileName", deletePortfolioCoverController as RequestHandler);


router.delete("/media/event/:eventId", deleteEvent as RequestHandler);
router.delete("/media/:eventId/:fileName", deleteFile as RequestHandler);

router.delete("/media/:eventId/:fileName", deleteFile as RequestHandler);
router.post("/media/bulk-delete/:eventId", bulkDeleteFiles as RequestHandler);


//Download Routes
//Public now

// router.get('/download/:eventId/:fileName', downloadSingleFileHandler as RequestHandler);
// router.post('/download-multiple-zip/:eventId', downloadMultipleFilesHandler as RequestHandler);
// router.post('/download-multiple-urls/:eventId', getBulkDownloadUrlsHandler as RequestHandler);


export default router;
