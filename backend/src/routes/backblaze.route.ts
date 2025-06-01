import express, { RequestHandler } from "express";
import UploadHandler, { bulkDeleteFiles, deleteEvent, deleteFile, GetMedia } from "../controllers/backblaze";


const router = express.Router();

router.post("/upload", UploadHandler as RequestHandler);
router.get("/events/:eventId", GetMedia as RequestHandler);


router.delete("/media/event/:eventId", deleteEvent as RequestHandler);
router.delete("/media/:eventId/:fileName", deleteFile as RequestHandler);

// Add these routes
router.delete("/media/:eventId/:fileName", deleteFile as RequestHandler);
router.post("/media/bulk-delete/:eventId", bulkDeleteFiles as RequestHandler);

export default router;
