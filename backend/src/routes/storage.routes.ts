import { RequestHandler, Router } from "express";
import Storagestatushandler, { storagedashboardupdate } from "../controllers/storage";


const storagerouter = Router();

storagerouter.get("/user/storage",Storagestatushandler as RequestHandler);

storagerouter.get("/user/:userId",storagedashboardupdate as RequestHandler);

export default storagerouter;